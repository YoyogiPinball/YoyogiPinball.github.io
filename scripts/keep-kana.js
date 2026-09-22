// カタカナ語を行の途中で割らないよう、カタカナの連なりを <span class="kana-word"> で包む。
// 文節で折る指定（word-break:auto-phrase）は文節が1行に入りきらないと語の途中で割れるうえ、
// Chrome と Edge でしか効かない。この処理はブラウザを問わず、カタカナの連なりの中だけ改行を禁じる。
// 読み込み: <script src="scripts/keep-kana.js" defer></script>  CSS: .kana-word { word-break:keep-all; }
(() => {
    const TARGET = 'h1, h2, h3, h4, p, li, dt, dd, figcaption, td, th, blockquote';
    const SKIP = '.kana-word, code, pre, kbd, samp, script, style, textarea';
    // 小書きを含むカタカナと長音。中黒（・）は語の区切りなので含めない
    const RUN = /[ァ-ヺー]{2,}/g;

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
