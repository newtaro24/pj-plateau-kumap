# アプリケーションディレクトリ (app/)

このディレクトリには、札幌市ヒグマ危険度3Dマップのフロントエンドアプリケーションが含まれています。

## 技術スタック

- **React 19** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Vite** - 高速なビルドツール＆開発サーバー
- **Cesium JS** - 3D地球儀・地理空間データ可視化
- **Resium** - Cesium用のReactコンポーネントライブラリ

## セットアップ

### 前提条件

- Node.js 20.x 以上
- npm（Node.jsに付属）
- ルートディレクトリで `npm install` を実行済み

### 依存関係のインストール

```bash
npm install
```

### 環境変数の設定

`.env` ファイルを作成します：

```bash
cp .env.example .env
```

`.env` ファイルを編集し、以下の値を設定：

```env
# Cesium ion アクセストークン
# https://ion.cesium.com/ で取得
VITE_CESIUM_ION_TOKEN=your_token_here

# PLATEAU 3D都市モデルのアセットID
# Cesium ionにアップロードした3D TilesのアセットID
VITE_CESIUM_ASSET_ID_CHUO=your_chuo_asset_id
VITE_CESIUM_ASSET_ID_MINAMI=your_minami_asset_id
VITE_CESIUM_ASSET_ID_NISHI=your_nishi_asset_id
```

## 開発

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開いてください。

### 利用可能なスクリプト

```bash
# 開発サーバー起動（HMR有効）
npm run dev

# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# TypeScript型チェック
npm run type-check
```

> **Note**: リント・フォーマットはルートディレクトリから実行します。
> ```bash
> cd ..
> npm run lint    # Biomeリント
> npm run fix     # 自動修正
> ```

## プロジェクト構造

```
app/
├── public/              # 静的アセット
├── src/
│   ├── components/      # Reactコンポーネント
│   │   └── DataSourceCredit.tsx
│   ├── data/           # データファイル
│   │   └── bear_sightings.json
│   ├── App.tsx         # メインアプリケーションコンポーネント
│   ├── App.css         # アプリケーションスタイル
│   ├── main.tsx        # エントリーポイント
│   ├── index.css       # グローバルスタイル
│   └── vite-env.d.ts   # Vite型定義
├── index.html          # HTMLテンプレート
├── package.json        # 依存関係
├── tsconfig.json       # TypeScript設定
└── vite.config.ts      # Vite設定

```

## 主要なライブラリ

### Cesium JS

3D地球儀と地理空間データの可視化を提供します。

- 公式サイト: https://cesium.com/
- ドキュメント: https://cesium.com/docs/

### Resium

CesiumのReactラッパーライブラリで、Cesiumのコンポーネントを宣言的に使用できます。

- GitHub: https://github.com/reearth/resium
- ドキュメント: https://resium.reearth.io/

### データについて

**ヒグマ出没データ**:
- ファイル: `src/data/bear_sightings.json`
- 出典: [札幌市オープンデータ](https://ckan.pf-sapporo.jp/dataset/sapporo_bear_appearance)
- ライセンス: CC BY 4.0

**PLATEAU 3D都市モデル**:
- Cesium ionにアップロード済みの3D Tilesを使用
- 環境変数でアセットIDを指定

## トラブルシューティング

### Cesiumが表示されない

1. `.env` ファイルが正しく設定されているか確認
2. Cesium ionのトークンが有効か確認
3. ブラウザのコンソールでエラーを確認

### 3D建物が表示されない

1. アセットIDが正しいか確認
2. Cesium ionでアセットが公開されているか確認
3. アセットの処理が完了しているか確認（Cesium ionダッシュボード）

### 型エラーが出る

```bash
npm run type-check
```

で詳細なエラーを確認できます。

## さらに詳しく

プロジェクト全体の情報は[ルートディレクトリのREADME](../README.md)を参照してください。
