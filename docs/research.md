# 調査ログ (Research Notes)

このファイルには、技術調査、データソース調査、参考情報などをメモします。

---

## PLATEAU技術調査

**調査日**: 2025-11-12

### PLATEAU開発の選択肢

PLATEAUでの開発には主に3つのアプローチがある：

#### 1. ゲームエンジン開発（Unity/Unreal Engine）
- **PLATEAU SDK for Unity** (v3.4.0が最新)
- **PLATEAU SDK for Unreal Engine**
- CityGML形式を直接読み込める
- Unity向けにはToolkitsがあり、天気・人・車・街路樹などを簡単に追加可能
- 2025年3月に交通シミュレーション機能、電柱の結線機能などが追加

**メリット**: リッチな3D表現、シミュレーション機能が豊富
**デメリット**: Webへの展開にはビルド必要、ファイルサイズが大きくなりがち

#### 2. Web/GIS開発（推奨）
- **PLATEAU VIEW 4.0** がTypeScriptで構築されている（公式ビューワー）
- CityGMLを直接扱わず、変換してから使用する
- **PLATEAU GIS Converter**: 10種類の出力フォーマットをサポート
  - GeoJSON
  - 3D Tiles
  - glTF
  - MVT (Mapbox Vector Tiles)
  - その他

**推奨ライブラリ**:
- **Cesium JS**: 地理空間データの3D可視化に最適
- **TerriaJS**: GISベースのビューワー
- **Three.js**: 汎用3Dライブラリ（地理座標系の扱いは自前実装が必要）

**メリット**: ブラウザで直接アクセス可能、軽量、共有しやすい
**デメリット**: データ変換の手間、Unity SDKほどの機能は少ない

#### 3. Python/データ処理
- **PlateauKit + PlateauLab**: GeoPandasを使ったデータ処理
- 分析・前処理向け

### 本プロジェクトの推奨技術スタック

**アーバンデータチャレンジ向けには Web開発が最適**と判断：

#### フロントエンド
- **TypeScript + React** (または Next.js)
  - 理由: 型安全性、PLATEAU VIEW 4.0と同じ技術
- **Cesium JS** (3D地球儀・地理空間データ可視化)
  - 理由: 3D Tiles対応、地理座標系のサポート、大規模データ対応
- **React Three Fiber** (補助的に使用検討)
  - 理由: カスタム3D表現が必要な場合

#### データ変換・処理
- **PLATEAU GIS Converter** (Rust製、CLIツール)
  - CityGML → 3D Tiles/glTF/GeoJSON変換
- **Node.js + TypeScript** (補助スクリプト)

#### スタイリング
- **Tailwind CSS** または **MUI** (Material-UI)

### 開発フロー（想定）

1. 札幌市の3D都市モデル（CityGML）をダウンロード
2. PLATEAU GIS Converterで3D Tiles/glTFに変換
3. Cesium JSで読み込み・可視化
4. ヒグマ出没データをGeoJSONとしてオーバーレイ
5. ヒートマップ・シミュレーション機能を実装

### 参考リソース

- [PLATEAU開発チャート](https://www.mlit.go.jp/plateau/learning/plateau-development-chart/)
- [PLATEAU GitHub](https://github.com/Project-PLATEAU)
- [PLATEAU VIEW 4.0 ソースコード](https://github.com/Project-PLATEAU/PLATEAU-VIEW-4.0)
- [PLATEAU GIS Converter](https://github.com/Project-PLATEAU/PLATEAU-GIS-Converter)

### 次のステップ

- [ ] Cesium JSの動作確認
- [ ] 札幌市3D都市モデルのダウンロードと変換テスト
- [ ] ヒグマ出没データの入手元調査
