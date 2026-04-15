# デザインガイドライン：DAILY FOCUS

## 目次
1. デザインコンセプト
2. カラーパレット
3. タイポグラフィ
4. UIコンポーネント
5. レイアウトルール

---

## 1. デザインコンセプト

### デザインキーワード

#### 1. シンプル
- 理由  
  DAILY FOCUS は「今日やることを、ひとつに絞る」という価値を提供するサービスであり、画面自体も迷いの少ないシンプルな構成であることが重要である。
- 表現方法  
  白を基調とした余白の広いレイアウト、情報の絞られた見出し、不要な装飾を減らしたUIで表現する。

#### 2. 集中
- 理由  
  本サービスの中心価値は、ユーザーが日々のタスクに集中しやすい状態を作ることにあるため、デザインも視線が散らない構成である必要がある。
- 表現方法  
  コントラストのはっきりした見出し、重要なボタンだけを強調する色使い、セクションごとに整理された構造で表現する。

#### 3. 信頼感
- 理由  
  毎日のタスク管理や振り返りを任せるサービスであるため、継続利用したくなる安心感と安定感が必要である。
- 表現方法  
  落ち着いたダークトーンのメインカラー、読みやすいタイポグラフィ、整然としたカードレイアウトによって表現する。

---

## 2. カラーパレット

### カラーパレット

| 色の種類 | カラーコード | 色見本 | 使用場面 |
| --- | --- | --- | --- |
| メインカラー | `#111827` | <span style="display:inline-block;width:56px;height:20px;background:#111827;border:1px solid #ccc;border-radius:4px;"></span> | ヘッダー、主要ボタン、重要見出し |
| サブカラー | `#E5E7EB` | <span style="display:inline-block;width:56px;height:20px;background:#E5E7EB;border:1px solid #ccc;border-radius:4px;"></span> | カード背景、区切り線、入力欄背景 |
| アクセントカラー | `#2563EB` | <span style="display:inline-block;width:56px;height:20px;background:#2563EB;border:1px solid #ccc;border-radius:4px;"></span> | フォーカス時の強調、リンク、選択状態 |
| 背景色 | `#F9FAFB` | <span style="display:inline-block;width:56px;height:20px;background:#F9FAFB;border:1px solid #ccc;border-radius:4px;"></span> | ページ全体の背景 |
| テキスト色 | `#1F2937` | <span style="display:inline-block;width:56px;height:20px;background:#1F2937;border:1px solid #ccc;border-radius:4px;"></span> | 本文テキスト、通常見出し |
| テキスト色（薄） | `#6B7280` | <span style="display:inline-block;width:56px;height:20px;background:#6B7280;border:1px solid #ccc;border-radius:4px;"></span> | 補助テキスト、注釈、プレースホルダー |

### 選定理由

- `#111827`  
  強すぎないダークカラーであり、集中感と信頼感を与える。主要CTAや見出しに使用することで、画面の軸を明確にできる。
- `#E5E7EB`  
  無機質になりすぎない柔らかなグレーで、情報の区切りやカード背景に使いやすい。
- `#2563EB`  
  フォーカス状態やリンクに使用することで、ユーザーの視線を自然に誘導できる。青は信頼感や知性の印象も与える。
- `#F9FAFB`  
  純白よりも柔らかい背景色とすることで、長時間見ても疲れにくい印象を作る。
- `#1F2937` と `#6B7280`  
  情報の階層をつけながら、本文の読みやすさと補助情報の整理を両立できる。

---

## 3. タイポグラフィ

### フォント設定

推奨フォントは `Noto Sans JP` とする。日本語対応が安定しており、シンプルで可読性が高く、Webでも使いやすい。

| 要素 | フォント名 | サイズ | 太さ | 行間 | 用途 |
| --- | --- | --- | --- | --- | --- |
| h1（大見出し） | Noto Sans JP | 48px | 700 | 1.3 | ページタイトル、ヒーロー見出し |
| h2（中見出し） | Noto Sans JP | 32px | 700 | 1.4 | セクション見出し |
| h3（小見出し） | Noto Sans JP | 24px | 700 | 1.4 | 機能見出し、カードタイトル |
| 本文 | Noto Sans JP | 16px | 400 | 1.8 | 通常テキスト |
| キャプション | Noto Sans JP | 13px | 400 | 1.6 | 補足説明、注釈 |
| ボタン | Noto Sans JP | 16px | 700 | — | ボタンテキスト |

### タイポグラフィルール

- letter-spacing  
  - h1〜h2：`0em`
  - h3：`0.01em`
  - 本文：`0.02em`
- 本文は行間を広めに取り、読みやすさを優先する
- 強調は太字と余白で表現し、過度な文字装飾は使わない

---

## 4. UIコンポーネント

実物のコンポーネントをこのページ内で確認できるよう、HTMLとCSSのサンプルを以下に記載する。

### ボタン

```html
<style>
.dg-btn-row { display:flex; gap:12px; flex-wrap:wrap; margin:16px 0; }
.dg-btn {
  border:none;
  border-radius:12px;
  padding:12px 20px;
  font-family:"Noto Sans JP", sans-serif;
  font-size:16px;
  font-weight:700;
  cursor:pointer;
  transition:all .2s ease;
}
.dg-btn-primary {
  background:#111827;
  color:#FFFFFF;
}
.dg-btn-primary:hover {
  background:#1F2937;
}
.dg-btn-secondary {
  background:#FFFFFF;
  color:#111827;
  border:1px solid #D1D5DB;
}
.dg-btn-secondary:hover {
  background:#F3F4F6;
}
.dg-btn-danger {
  background:#DC2626;
  color:#FFFFFF;
}
.dg-btn-danger:hover {
  background:#B91C1C;
}
</style>

<div class="dg-btn-row">
  <button class="dg-btn dg-btn-primary">無料ではじめる</button>
  <button class="dg-btn dg-btn-secondary">詳しく見る</button>
  <button class="dg-btn dg-btn-danger">削除する</button>
</div>
```

### フォーム要素

```html
<style>
.dg-form {
  display:grid;
  gap:16px;
  max-width:420px;
  margin:16px 0;
  font-family:"Noto Sans JP", sans-serif;
}
.dg-input,
.dg-select,
.dg-textarea {
  width:100%;
  padding:12px 14px;
  border:1px solid #D1D5DB;
  border-radius:12px;
  background:#FFFFFF;
  color:#1F2937;
  font-size:16px;
  box-sizing:border-box;
}
.dg-input:focus,
.dg-select:focus,
.dg-textarea:focus {
  outline:none;
  border-color:#2563EB;
  box-shadow:0 0 0 3px rgba(37, 99, 235, 0.15);
}
.dg-input-error {
  border-color:#DC2626;
}
.dg-check-row,
.dg-radio-row {
  display:flex;
  gap:16px;
  align-items:center;
  color:#1F2937;
  font-size:14px;
}
</style>

<div class="dg-form">
  <input class="dg-input" type="text" placeholder="メールアドレス" />
  <select class="dg-select">
    <option>優先度を選択</option>
    <option>High</option>
    <option>Medium</option>
    <option>Low</option>
  </select>
  <textarea class="dg-textarea" rows="4" placeholder="メモを入力"></textarea>
  <input class="dg-input dg-input-error" type="text" placeholder="エラー状態" />
  <label class="dg-check-row"><input type="checkbox" /> 完了にする</label>
  <div class="dg-radio-row">
    <label><input type="radio" name="focus" checked /> 集中する</label>
    <label><input type="radio" name="focus" /> 後でやる</label>
  </div>
</div>
```

### カード・テーブル・アラート

```html
<style>
.dg-card {
  max-width:360px;
  border:1px solid #E5E7EB;
  border-radius:16px;
  background:#FFFFFF;
  padding:20px;
  box-shadow:0 8px 24px rgba(17, 24, 39, 0.06);
  font-family:"Noto Sans JP", sans-serif;
  margin:16px 0;
}
.dg-card-image {
  height:140px;
  border-radius:12px;
  background:#E5E7EB;
  margin-bottom:16px;
}
.dg-card-title {
  font-size:22px;
  font-weight:700;
  margin-bottom:8px;
  color:#111827;
}
.dg-card-text {
  font-size:14px;
  line-height:1.8;
  color:#6B7280;
  margin-bottom:16px;
}
.dg-table {
  width:100%;
  border-collapse:collapse;
  font-family:"Noto Sans JP", sans-serif;
  margin:16px 0;
}
.dg-table th,
.dg-table td {
  border:1px solid #E5E7EB;
  padding:12px 16px;
  text-align:left;
}
.dg-table th {
  background:#F3F4F6;
  color:#111827;
}
.dg-table tbody tr:nth-child(even) {
  background:#F9FAFB;
}
.dg-alert {
  border-radius:12px;
  padding:14px 16px;
  font-family:"Noto Sans JP", sans-serif;
  margin:12px 0;
  border:1px solid transparent;
}
.dg-alert-info { background:#EFF6FF; color:#1D4ED8; border-color:#BFDBFE; }
.dg-alert-success { background:#ECFDF5; color:#047857; border-color:#A7F3D0; }
.dg-alert-warning { background:#FFFBEB; color:#B45309; border-color:#FDE68A; }
.dg-alert-error { background:#FEF2F2; color:#B91C1C; border-color:#FECACA; }
</style>

<div class="dg-card">
  <div class="dg-card-image"></div>
  <div class="dg-card-title">今日のフォーカス</div>
  <div class="dg-card-text">その日の最重要タスクを1つに絞り、迷いなく着手するためのカードデザイン。</div>
  <button class="dg-btn dg-btn-primary">詳しく見る</button>
</div>

<table class="dg-table">
  <thead>
    <tr>
      <th>タスク名</th>
      <th>時間</th>
      <th>優先度</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>重要タスク</td>
      <td>09:30 - 11:00</td>
      <td>High</td>
    </tr>
    <tr>
      <td>集中タスク</td>
      <td>11:30 - 12:30</td>
      <td>Medium</td>
    </tr>
  </tbody>
</table>

<div class="dg-alert dg-alert-info">情報：フォーカスセッションを開始できます。</div>
<div class="dg-alert dg-alert-success">成功：今日の振り返りが保存されました。</div>
<div class="dg-alert dg-alert-warning">警告：未完了タスクが残っています。</div>
<div class="dg-alert dg-alert-error">エラー：入力内容を確認してください。</div>
```

---

## 5. レイアウトルール

### レイアウト基本ルール

- コンテンツ最大幅  
  `1200px`

- グリッドシステム  
  `12カラム`  
  ガター幅：`24px`

- セクション間の余白  
  `96px` を基本とする

- 要素間の余白  
  `8px / 16px / 24px / 32px` の4段階で管理する

- 角丸  
  - 小要素：`8px`
  - ボタン、入力欄：`12px`
  - カード：`16px`
  - 大きなコンテナ：`20px`

- シャドウ  
  `box-shadow: 0 8px 24px rgba(17, 24, 39, 0.06);`

- ブレークポイント  
  - PC：`1200px以上`
  - タブレット：`768px〜1199px`
  - スマートフォン：`767px以下`

### 運用ルール

- 余白で情報階層を作り、線や色の使いすぎで整理しない
- 主要CTAは1画面に1〜2個までに抑える
- 強調色はリンク、フォーカス、選択状態など限定的に使う
- カードやフォームは統一された角丸と余白ルールで管理する

