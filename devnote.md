# 開発ノート

## 2026-01-31 Favicon追加
- **概要**: サイトにファビコンを設定しました。
- **実装内容**:
  - `images/favicon.ico` (32x32) が配置されていることを確認しました。
  - `index.html` の `<head>` 内に `<link rel="icon" href="images/favicon.ico">` を追加しました。
- **ステータス**: 完了 (ブラウザでの表示確認待ち)

## 2026-02-22 La_Byleの追加
- **概要**: ポートフォリオサイト（`index.html`）に「La_Byle」を追加する。
- **実装内容の記録**:
  - `images/La_Byle.png` を使用し、Projectsセクションの6つ目のカードとして追加。
  - タイトル: La_Byle
  - 説明文: マルチモニター環境に特化した壁紙統制ツール。フォルダ監視による自動更新やスタートアップ起動を備えたPython製GUIアプリ。
  - タグ: Python
  - リンク先: https://github.com/YoyogiPinball/La_Byle
- **動作確認結果**:
  - `index.html` にて6番目のプロジェクトカードとしてレイアウト崩れなく表示されることを確認。画像の拡大表示も正常。
- **次のステップ**: 引き続き追加したいプロジェクトやSNS導線の組み込み（必要に応じて）。
- **ステータス**: 完了 (commit & push済み)

## 2026-02-22 Buy Me a Coffeeリンクの追加
- **概要**: ポートフォリオサイト（`index.html`）のContactセクションに「Buy Me a Coffee」のリンクを追加する。
- **実装内容の記録**:
  - `Buy Me a Coffee` の公式サイトのブランドカラー（黄色: `#FFDD00`）とアイコン（SVG）を使用し `index.html` にボタンを追加。
  - お問い合わせフォームボタンの横に並べる形で配置。
  - リンク先: https://buymeacoffee.com/yoyogipinball
- **動作確認結果**:
  - ローカルにてボタンの表示およびリンク先が正しいことを確認。
- **次のステップ**: Zenn等、他に追加するべきプラットフォームリンクの検討。
- **ステータス**: 完了 (commit & push済み)
