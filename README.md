# Daily Focus

本リポジトリには、提出用の制作ドキュメント一式とフロントエンド実装を整理して格納しています。

## 提出物の構成

- 制作ドキュメント一式  
  - `_制作ドキュメント/`
- フロントエンド実装一式  
  - `_フロントエンド実装/`

## 制作ドキュメント一覧

- `01_企画提案書_DAILY_FOCUS.md`
- `02_マーケットリサーチ_DAILY_FOCUS.md`
- `03_ペルソナシート_DAILY_FOCUS.md`
- `04_サイトマップ_DAILY_FOCUS.md`
- `05_ワイヤーフレーム_DAILY_FOCUS.md`
- `06_デザインガイドライン_DAILY_FOCUS.md`
- `07_振り返り・技術記事_DAILY_FOCUS.md`

## フロントエンド実装

- 完成版アプリ  
  - GitHub Pages: `https://kameyama12345.github.io/Daily-Focus/`
- 提出用の静的フロント一式  
  - `_フロントエンド実装/index.html`
  - `_フロントエンド実装/login.html`
  - `_フロントエンド実装/signup.html`
  - `_フロントエンド実装/dashboard.html`
  - `_フロントエンド実装/detail.html`
  - `_フロントエンド実装/edit.html`

## ローカル確認方法

```bash
npm install
npm run dev
```

- アプリ確認先: `http://localhost:3000`
- GitHub Pages 公開先: `https://kameyama12345.github.io/Daily-Focus/`

## 技術構成

- Next.js
- React
- TypeScript
- Tailwind CSS
- date-fns
- lucide-react

## アプリ概要

- 今日の縦型タイムライン表示
- タスクの追加・編集・削除
- タスクブロックのドラッグ移動とリサイズ
- 空き時間の可視化
- ポモドーロタイマー
- 作業ログ蓄積
- 生産性ダッシュボード
- ローカル保存
- レスポンシブ対応
