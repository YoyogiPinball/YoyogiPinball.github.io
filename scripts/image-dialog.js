// 1x1 の透明GIF。src を空文字にすると HTML 仕様違反、属性ごと外すと画像ソース欠落になるため
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const dialog = document.getElementById('image-dialog');

if (dialog) {
    const dialogImage = document.getElementById('dialog-image');
    const closeButton = dialog.querySelector('.dialog-close');

    // 拡大表示のトリガーは画像ファイルへのリンク。JavaScript が動く環境だけモーダルへ差し替える
    document.querySelectorAll('[data-image]').forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            // Ctrl/Cmd+クリックなどの「別タブで開く」操作は、リンク本来の動作に任せる
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            event.preventDefault();
            const sourceImage = trigger.querySelector('img');
            dialogImage.src = trigger.dataset.image;
            dialogImage.alt = sourceImage?.alt || 'スクリーンショット';
            dialog.showModal();
        });
    });

    closeButton?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
        dialogImage.src = BLANK;
        dialogImage.alt = '';
    });
}
