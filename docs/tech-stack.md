# 技術スタック詳細

**最終更新**: 2025-11-12

## アーキテクチャ概要

```
┌─────────────────────────────────────┐
│   ブラウザ (Chrome, Firefox等)      │
├─────────────────────────────────────┤
│  React + TypeScript (UI Layer)      │
├─────────────────────────────────────┤
│  Cesium JS (3D Visualization)       │
├─────────────────────────────────────┤
│  データレイヤー                      │
│  - 3D Tiles (PLATEAU 3D都市モデル)  │
│  - GeoJSON (ヒグマ出没データ)       │
└─────────────────────────────────────┘

        ↑ (静的ホスティング)
┌─────────────────────────────────────┐
│  Vercel / GitHub Pages / Netlify    │
└─────────────────────────────────────┘
```

## フロントエンド

### コアライブラリ

| ライブラリ | バージョン | 用途 |
|-----------|-----------|------|
| **React** | 18+ | UIフレームワーク |
| **TypeScript** | 5+ | 型安全な開発 |
| **Vite** | 5+ | ビルドツール |
| **Cesium JS** | 1.120+ | 3D地球儀・地理空間データ可視化 |

### スタイリング

- **Tailwind CSS** または **CSS Modules**
- レスポンシブデザイン対応

### 状態管理

- React Hooks (useState, useContext)
- 必要に応じてZustand検討

### その他ライブラリ（検討中）

- **date-fns**: 日時処理
- **recharts** または **Chart.js**: グラフ表示（傾向分析用）

## データ処理・変換

### PLATEAU GIS Converter

- **言語**: Rust製のCLIツール
- **機能**: CityGML → 3D Tiles/glTF/GeoJSON変換
- **リポジトリ**: [Project-PLATEAU/PLATEAU-GIS-Converter](https://github.com/Project-PLATEAU/PLATEAU-GIS-Converter)

### 補助スクリプト

- **Node.js + TypeScript**
- ヒグマデータの整形・GeoJSON変換用

## データフォーマット

### 3D都市モデル

- **入力**: CityGML (PLATEAU標準フォーマット)
- **変換後**: 3D Tiles
- **理由**: Cesium JSがネイティブサポート、大規模データに最適

### ヒグマ出没データ

- **フォーマット**: GeoJSON
- **スキーマ例**:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [141.3544, 43.0642]
      },
      "properties": {
        "date": "2025-10-15T14:30:00+09:00",
        "description": "目撃情報の詳細",
        "severity": "high"
      }
    }
  ]
}
```

## 開発環境

### 必須ツール

- **Node.js**: 20+ (LTS推奨)
- **npm** または **pnpm**
- **Git**

### 推奨エディタ

- VS Code + 以下の拡張機能:
  - ESLint
  - Prettier
  - TypeScript Vue Plugin (Volar)

## ホスティング

### 候補

1. **Vercel** (推奨)
   - 自動デプロイ、高速CDN
2. **GitHub Pages**
   - 無料、簡単
3. **Netlify**
   - 同等の機能

### 静的アセット

- 3D Tilesデータは別途ホスティング検討
  - GitHub LFS
  - Cloudflare R2
  - Cesium ion（有料プランあり）

## Cesium JS について

### 選定理由

1. **3D Tiles対応**: PLATEAUの推奨フォーマットをネイティブサポート
2. **地理座標系**: WGS84、UTMなど主要な座標系に対応
3. **大規模データ**: LOD (Level of Detail) で効率的にレンダリング
4. **オープンソース**: Apache 2.0ライセンス
5. **豊富な機能**: 地形、影、時刻シミュレーションなど

### Cesium ionについて

- Cesiumが提供するクラウドサービス
- 3D Tilesのホスティング・配信に最適
- 無料枠あり（月120万タイル）
- 必要に応じて検討

## パフォーマンス最適化

### 予定している最適化

- [ ] 3D Tilesの適切なLOD設定
- [ ] Code Splitting（Vite標準機能）
- [ ] 画像・アセットの最適化
- [ ] Lazy Loading
- [ ] Service Worker (将来的に)

## セキュリティ

- HTTPS必須
- CSP (Content Security Policy) 設定
- XSS対策（Reactのデフォルト機能）
- 依存関係の定期的な更新

## 参考リソース

- [Cesium公式ドキュメント](https://cesium.com/docs/)
- [PLATEAU VIEW 4.0ソースコード](https://github.com/Project-PLATEAU/PLATEAU-VIEW-4.0)
- [React公式ドキュメント](https://react.dev/)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
