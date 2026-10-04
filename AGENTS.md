# AGENTS.md — YoyogiPinball.github.io

制作物、技術スキル、発信活動を掲載する静的ポートフォリオサイトです。`main`ブランチをGitHub Pagesで公開します。

## 構成

| パス | 役割 |
|---|---|
| `index.html` | トップページ。CSSをページ内に持つ |
| `yp-signage.html` / `oshi-mado.html` / `oshi-sche-webapp.html` / `kakeibo.html` / `glance.html` | プロジェクト詳細 |
| `styles/project-detail.css` | 詳細ページ共通CSS |
| `scripts/image-dialog.js` | スクリーンショット拡大処理 |
| `scripts/check-typography.mjs` | 文字組みの検査。設定は `scripts/typography.config.json` |
| `images/` | 公開画像 |
| `design-prototypes/` | 比較試作。Git管理外 |
| `_Archives/` | 過去資料 |

## ローカル確認

ビルド工程はありません。外部へ公開しない確認は次を使います。

```bash
node --check scripts/image-dialog.js
node scripts/check-typography.mjs
python3 -m http.server 8000
```

ブラウザ確認が必要な場合は `http://127.0.0.1:8000/` を開きます。サーバー起動は必要な間だけ行い、終了します。

## 公開境界

- `.env`、鍵、token、credentials、個人用試作、Playwright出力をコミットしません。
- `images/`へ追加する画像は、公開可能な内容と権利関係を確認します。
- 各紹介ページの説明は、対応するプロジェクトの現行READMEと実装に合わせます。
- 外部CDNとWebフォントを新規追加しません。現在は外部依存なしで表示します。

## 表示規則

- 本文へレイアウト目的の手動 `<br>` を入れません。折返しはCSSへ任せます。
- 見出しの改行位置を制御するときだけ、意味のまとまりを `<span>` で囲みます。
- 詳細ページの共通変更は `styles/project-detail.css` と `scripts/image-dialog.js` へ寄せ、ページごとの複製を増やしません。
- 画像ダイアログはネイティブ `<dialog>` を使う現在の実装を前提にします。
- 文字サイズは本文16px、ラベル・技術名・キャプションは14pxにします。14px未満は使いません（デジタル庁デザインシステムの基準）。値は各CSSの `:root` にある `--fs-*` と `--lh-body` を使います。
- 改行・禁則は共通の指定（`line-break:strict`、見出しの `text-wrap:balance`、本文の `text-wrap:pretty`、見出しと本文の `word-break:auto-phrase`）に任せ、ページ単位で上書きしません。カタカナ語や英単語を行の途中で割らないためです。
- 全ページで `scripts/keep-kana.js` を読みます（カタカナ語を割らないための処理）。新しいページを足したら読み込みも足します。
- 製品名の大見出しは `word-break:keep-all` で守ります。語を守るために `<span>` や `white-space:nowrap` を足しません。
- 和文の字間は0〜0.02emにします。英字ロゴと英大文字ラベルだけは広げてよいです。
- 表示を変えたら `node scripts/check-typography.mjs` を実行し、出た一覧と `tmp/typography/` のスクリーンショットを確認します。
- 画面の文言と配置を変えたら、`screen-audit` スキルの監査を通します。用語の基準はリポジトリ直下の `ui-terms.md` です（無ければ監査の最初に作ります）。

## デプロイ

`main`へのpushがそのまま公開デプロイになります。pushは別途依頼された場合だけ実行し、公開前にリンク、画像、モバイル幅、各プロジェクトの記述を確認します。

## レビューキュー

- ユーザーの「レビューキューへ追加」「レビューキューに置く」は、`30-Notes/review-queue/` への保存ではなく、`00-Inbox/Review Queue.base` の「未読」ビューへの登録を意味します。
- 作成前に `~/Batches/rules/doc-rules.md` の「review-queue への登録（確認待ち資料のキュー）」を読み、同節の書式を使います。
- 作成後は必須 frontmatter、特に `read: false` を Obsidian が認識していることを確認します。ファイルの作成成功だけでは完了としません。

## 完了条件

- JavaScript構文とHTMLの基本構造を確認する。
- 追加したローカルリンクと画像参照が存在する。
- 公開対象外ファイルがGit差分へ入っていない。
- デプロイは実施せず、必要なら別の承認事項として報告する。
