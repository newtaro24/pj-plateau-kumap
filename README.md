# pj-plateau-kumap

**札幌ヒグマ出没3Dビジュアライザー**

アーバンデータチャレンジ2025 応募作品

## プロジェクト概要

札幌市では市街地近郊の山林にヒグマが生息しており、市民の安全が重要な課題となっています。
本プロジェクトは、**PLATEAUの3D都市モデルとヒグマ出没データを組み合わせた、インタラクティブなデータビジュアライゼーション作品**です。
立体的な都市モデル上でヒグマの出没状況を可視化することで、都市と野生動物の共存という課題を視覚的に理解できます。

## コンセプト

**「データで見える、ヒグマと都市の距離」**

- PLATEAU 3D都市モデルとヒグマ出没データの融合
- 時系列アニメーションで見る出没傾向の変化
- ヒートマップによる危険度の可視化
- インタラクティブな3D空間での探索体験
- データビジュアライゼーションを通じた防災意識の向上

## 主な機能

### 実装済み ✅
- [x] PLATEAU 3D都市モデル表示（中央区・南区・西区）
- [x] ヒグマ出没データ318件の3Dマッピング
- [x] 危険度による色分け表示（目撃・足跡/フン・その他）
- [x] マーカークリックで詳細情報表示

### 開発予定 🚧
- [ ] 時系列アニメーション機能（月別の出没推移を再生）
- [ ] ヒートマップ表示（出没頻度の高いエリアを可視化）
- [ ] カメラツアー機能（注目エリアを自動で巡回）
- [ ] 統計ダッシュボード（月別・区別の分析グラフ）

## 使用データ

### ヒグマ出没情報（実装済み）
- **データ名**: 札幌市内のヒグマ出没情報（2025年）
- **提供元**: 札幌市環境局
- **データソース**: [札幌市オープンデータプラットフォーム](https://ckan.pf-sapporo.jp/dataset/sapporo_bear_appearance)
- **ライセンス**: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.ja)
- **データ件数**: 318件（2025年分）
- **データ形式**: CSV → GeoJSON変換

### PLATEAU 3D都市モデル（予定）
- **データ名**: PLATEAU 札幌市3D都市モデル
- **提供元**: 国土交通省 Project PLATEAU
- **データソース**: [G空間情報センター](https://www.geospatial.jp/ckan/dataset/plateau)
- **ライセンス**: 政府標準利用規約（第2.0版）

詳細なライセンス情報と利用規約は [docs/data-sources.md](docs/data-sources.md) を参照してください。

## 技術スタック

Web開発で実装（ブラウザで直接アクセス可能、共有しやすい）

### フロントエンド
- **TypeScript + React** (Vite)
- **Cesium JS** - 3D地球儀・地理空間データ可視化ライブラリ
  - 3D Tiles対応、地理座標系サポート

### コード品質管理
- **Biome** - 高速なフォーマッター＆リンター
- **Husky** - Git hooksによる自動チェック

### データ変換・処理
- **PLATEAU GIS Converter** - CityGML → 3D Tiles/glTF変換ツール
- **Node.js/TypeScript** - 補助スクリプト

### データフォーマット
- 3D都市モデル: 3D Tiles / glTF（CityGMLから変換）
- ヒグマデータ: GeoJSON

詳細は [docs/tech-stack.md](docs/tech-stack.md) 参照

## 開発環境のセットアップ

### クイックスタート

```bash
# 1. クローン
git clone https://github.com/newtaro24/pj-plateau-kumap.git
cd pj-plateau-kumap

# 2. 依存関係のインストール
npm install
cd app && npm install && cd ..

# 3. 環境変数の設定
cd app
cp .env.example .env
# .envファイルを編集してCesium ionトークンを設定

# 4. 開発サーバー起動
npm run dev
```

詳細なセットアップ手順は [app/README.md](app/README.md) を参照してください。

### 開発コマンド

```bash
npm run dev      # 開発サーバー起動
npm run lint     # Biomeリント
npm run fix      # 自動修正
npm run check    # 型チェック + リント
```

## データ更新

### ヒグマ出没データの更新方法

最新のヒグマ出没情報を反映する場合は、以下の手順で実施します：

```bash
# 1. 札幌市オープンデータから最新のCSVファイルをダウンロード
# https://ckan.pf-sapporo.jp/dataset/sapporo_bear_appearance

# 2. CSVをGeoJSON/JSONに変換
npm run convert-data <CSVファイルのパス>

# 例：
npm run convert-data ./bear_sightings_2025.csv
```

**変換処理**:
- 入力: CSV形式のヒグマ出没データ（日付、時刻、区、出没場所、緯度、経度、状況）
- 出力: `app/src/data/bear_sightings_2025.json` (GeoJSON形式)
- 危険度判定: 状況フィールドから自動で危険度を判定（目撃=high、足跡/フン=medium、その他=low）

**PLATEAU 3D都市モデル**:
- 3D Tilesは[Cesium ion](https://ion.cesium.com/)にアップロード済み
- ローカルには保存していません（容量削減のため）
- アセットIDは `.env` ファイルで管理

## 開発ステータス

**Phase 2: 基本機能実装**（現在）
- [x] Phase 1完了（コンセプト策定・技術調査・技術スタック決定）
- [x] Vite + React + TypeScript + Cesium JS環境構築
- [x] 札幌市中心の3D地球儀表示
- [x] 実際のヒグマ出没データ統合（318件）
- [x] 危険度による色分け表示
- [x] データソースとライセンス情報のドキュメント化
- [ ] PLATEAUデータ統合
- [ ] 時系列フィルタリング機能
- [ ] ヒートマップ表示

## 参考リンク

- [PLATEAU](https://www.mlit.go.jp/plateau/)
- [アーバンデータチャレンジ](https://urbandata-challenge.jp/)
- [札幌市オープンデータ](https://data.city.sapporo.jp/)

---

**開発開始日**: 2025-11-12
