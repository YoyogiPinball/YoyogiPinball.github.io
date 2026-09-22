// 日本語ページの文字組みを全ページ・複数の画面幅で測り、崩れていそうな箇所を一覧にする。
// 使い方: node scripts/check-typography.mjs [設定ファイル]
//   Playwright が import できない環境では PLAYWRIGHT_MODULE に playwright の index.mjs の場所を渡す。
// 終了コード: 14px 未満の文字か横スクロールがあれば 1。改行の候補は一覧に出すだけで失敗にしない。
import { readFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(process.argv[2] ?? resolve(here, 'typography.config.json'));
const config = JSON.parse(await readFile(configPath, 'utf8'));
const root = resolve(dirname(configPath), config.root ?? '..');
const shotDir = config.screenshotDir ? resolve(root, config.screenshotDir) : null;
const minFontSize = config.minFontSize ?? 14;

const playwright = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
// 既定は Chromium だけ。設定の browsers に firefox / webkit（Safari のエンジン）を足すと、それぞれで測る
const engines = config.browsers ?? ['chromium'];

// ページ内で走る計測。見出しの行分割・最終行・文字サイズ・はみ出しを返す
function measure({ headingSelector, blockSelector, minFontSize }) {
    const lineSplit = (el) => {
        const lines = [];
        let top = null;
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            for (let i = 0; i < node.data.length; i++) {
                const range = document.createRange();
                range.setStart(node, i);
                range.setEnd(node, i + 1);
                const rect = range.getClientRects()[0];
                if (!rect) continue;
                if (top === null || Math.abs(rect.top - top) > 4) { lines.push(''); top = rect.top; }
                lines[lines.length - 1] += node.data[i];
            }
        }
        return lines.filter((s) => s.trim());
    };
    const tidy = (s) => s.replace(/\s+/g, ' ').trim();
    const visible = (el) => el.offsetParent !== null || getComputedStyle(el).position === 'fixed';
    const charClass = (c) => (/[ァ-ヶー]/.test(c) ? 'kana' : /[A-Za-z0-9]/.test(c) ? 'alnum' : null);
    const out = { splits: [], orphans: [], small: [], overflow: 0 };

    // 見出しも本文も、カタカナ語・英単語が途中で割れていたら拾う
    for (const el of document.querySelectorAll(`${headingSelector}, ${blockSelector}`)) {
        if (!visible(el)) continue;
        const lines = lineSplit(el);
        for (let i = 0; i < lines.length - 1; i++) {
            // 空白で折れた行（英単語の間）は語の途中ではない
            if (/\s$/.test(lines[i]) || /^\s/.test(lines[i + 1])) continue;
            const a = lines[i].at(-1), b = lines[i + 1][0];
            // カタカナ同士・英数字同士が行をまたいだら語の途中とみなす。漢字語の途中は判定できない
            if (charClass(a) && charClass(a) === charClass(b)) {
                out.splits.push(lines.map(tidy).join(' ／ '));
                break;
            }
        }
    }
    for (const el of document.querySelectorAll(blockSelector)) {
        if (!visible(el)) continue;
        const lines = lineSplit(el).map(tidy);
        if (lines.length < 2) continue;
        // 最後の行が句読点・閉じ括弧を除いて1字、またはカタカナ語の切れ端だけのものを拾う。
        // 「する」「見る」のような2字の語は読めるので拾わない
        const last = lines.at(-1).replace(/[。、．，）」』】！？!?)]+$/u, '');
        const prevEnd = lines.at(-2).at(-1);
        const kanaTail = /^[ァ-ヶー]{1,2}$/.test(last) && /[ァ-ヶー]/.test(prevEnd);
        if (last.length <= 1 || kanaTail) out.orphans.push(`${lines.at(-2).slice(-8)} ／ ${lines.at(-1)}`);
    }
    const seen = new Set();
    for (const el of document.querySelectorAll('body *')) {
        if (!visible(el)) continue;
        const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.data.trim());
        if (!hasText) continue;
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (size < minFontSize) {
            const key = `${size}px ${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''}`;
            if (!seen.has(key)) { seen.add(key); out.small.push(key); }
        }
    }
    out.overflow = document.documentElement.scrollWidth - window.innerWidth;
    return out;
}

const report = [];
let failed = false;
if (shotDir) await mkdir(shotDir, { recursive: true });
for (const engine of engines) {
const browser = await playwright[engine].launch();
for (const width of config.widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    for (const file of config.pages) {
        await page.goto(pathToFileURL(resolve(root, file)).href);
        await page.evaluate(() => document.fonts.ready);
        const r = await page.evaluate(measure, {
            headingSelector: config.headingSelector,
            blockSelector: config.blockSelector,
            minFontSize,
        });
        if (r.small.length || r.overflow > 0) failed = true;
        report.push({ engine, width, file, ...r });
        if (shotDir) await page.screenshot({ path: resolve(shotDir, `${engine}-${file.replace(/\W+/g, '_')}-${width}.png`), fullPage: true });
    }
    await page.close();
}
await browser.close();
}

const rows = (key, label) => {
    const lines = report.flatMap((r) => r[key].map((v) => `| ${r.engine} | ${r.file} | ${r.width} | ${v} |`));
    return [`## ${label}（${lines.length}件）`, '', '| ブラウザ | ページ | 幅 | 内容 |', '|---|---|---|---|', ...lines, ''].join('\n');
};
console.log(rows('small', `${minFontSize}px 未満の文字（失敗扱い）`));
const over = report.filter((r) => r.overflow > 0).map((r) => `| ${r.engine} | ${r.file} | ${r.width} | ${r.overflow}px はみ出し |`);
console.log([`## 横スクロール（失敗扱い・${over.length}件）`, '', '| ブラウザ | ページ | 幅 | 内容 |', '|---|---|---|---|', ...over, ''].join('\n'));
console.log(rows('splits', '語の途中での改行の候補'));
console.log(rows('orphans', '最後の行が1字かカタカナ語の切れ端の候補'));
if (shotDir) console.log(`スクリーンショット: ${shotDir}`);
process.exit(failed ? 1 : 0);
