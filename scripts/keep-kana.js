// 本文の改行位置を整える。表示時に2つの処理を順に行う。HTML の原稿には手を入れない。
// 1. 読点（、）で区切った句を <span class="clause"> で包む。CSS の .clause { display:inline-block; } により、
//    句が行に収まらないときは句ごと次の行へ送り、読点の位置で改行させる（「読み取り、｜日・週・月ごとに」）。
//    句そのものが1行より長いときは、句の中で通常どおり折り返す。
//    「動画、ライブ、」のような短い句（MIN_CLAUSE 字未満）は次の句とつなげる。短い句だけの行ができるのを防ぐため。
// 2. カタカナ語を行の途中で割らないよう、カタカナの連なりを <span class="kana-word"> で包む。
//    文節で折る指定（word-break:auto-phrase）は文節が1行に入りきらないと語の途中で割れるうえ、
//    Chrome と Edge でしか効かない。この処理はブラウザを問わず、カタカナの連なりの中だけ改行を禁じる。
// 読み込み: <script src="scripts/keep-kana.js" defer></script>
// CSS: .clause { display:inline-block; }  .clause--long { display:inline; }  .kana-word { word-break:keep-all; }
(() => {
    // 句で包むのは本文の段落だけ。見出しは text-wrap:balance に任せ、段落を含む要素は中の段落で処理する
    const CLAUSE_TARGET = 'main p, main dd';
    const MIN_CLAUSE = 8;
    const TARGET = 'h1, h2, h3, h4, p, li, dt, dd, figcaption, td, th, blockquote';
    const SKIP = '.kana-word, code, pre, kbd, samp, script, style, textarea';
    // 小書きを含むカタカナと長音。中黒（・）は語の区切りなので含めない
    const RUN = /[ァ-ヺー]{2,}/g;

    for (const el of document.querySelectorAll(CLAUSE_TARGET)) {
        if (el.querySelector('p, div, ul, ol, dl')) continue;
        // 子ノードを順に見て、テキスト中の読点の直後で区切る。<a> や <code> は前後の句と同じ組に入れる
        const groups = [[]];
        for (const node of [...el.childNodes]) {
            if (node.nodeType !== Node.TEXT_NODE) {
                groups[groups.length - 1].push(node);
                continue;
            }
            const parts = node.data.split(/(?<=、)/);
            parts.forEach((part, i) => {
                if (part) groups[groups.length - 1].push(document.createTextNode(part));
                if (i < parts.length - 1) groups.push([]);
            });
        }
        const merged = [];
        let pending = [];
        for (const g of groups.filter((x) => x.length)) {
            pending.push(...g);
            if (pending.map((n) => n.textContent).join('').length >= MIN_CLAUSE) {
                merged.push(pending);
                pending = [];
            }
        }
        // 最後に残った短い句は直前の句につなげる
        if (pending.length) merged.length ? merged[merged.length - 1].push(...pending) : merged.push(pending);
        if (merged.length < 2) continue;
        el.replaceChildren(...merged.map((g) => {
            const span = document.createElement('span');
            span.className = 'clause';
            span.append(...g);
            return span;
        }));
    }

    // 1行に収まらない句は普通の文字列に戻す。箱のままだと句の最終行に次の句が続けられず、
    // 「曲を集め、」のような短い行が残る。画面幅が変わると収まる句も変わるので測り直す
    const fitClauses = () => {
        const clauses = document.querySelectorAll('.clause');
        clauses.forEach((c) => c.classList.remove('clause--long'));
        clauses.forEach((c) => {
            const lineHeight = parseFloat(getComputedStyle(c).lineHeight);
            if (c.getBoundingClientRect().height > lineHeight * 1.5) c.classList.add('clause--long');
        });
    };
    fitClauses();
    let timer;
    window.addEventListener('resize', () => {
        clearTimeout(timer);
        timer = setTimeout(fitClauses, 100);
    });

    const wrap = (node) => {
        const text = node.data;
        // test() ではなく search() で判定する。g 付きの test() は lastIndex を進め、
        // 続く matchAll() がその位置から探し始めて最初の語を取りこぼす
        if (text.search(RUN) === -1) return;
        const frag = document.createDocumentFragment();
        let last = 0;
        for (const m of text.matchAll(RUN)) {
            if (m.index > last) frag.append(text.slice(last, m.index));
            const span = document.createElement('span');
            span.className = 'kana-word';
            span.textContent = m[0];
            frag.append(span);
            last = m.index + m[0].length;
        }
        if (last < text.length) frag.append(text.slice(last));
        node.replaceWith(frag);
    };

    for (const root of document.querySelectorAll(TARGET)) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: (n) => (n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
        });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(wrap);
    }
})();
