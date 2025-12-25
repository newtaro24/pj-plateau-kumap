# pj-plateau-kumap - Claude Code メモリ

**プロジェクト**: 札幌ヒグマ出没3Dビジュアライザー
**コンセプト**: 「ヒグマに遭ったら、あなたは生き残れるか？」
**方向性**: PLATEAUの3D建物データを活用した空間的危険度評価

---

## Claude Code への指示

**ライブラリを使う際は必ずContext7 MCPを使用すること**
- コードを書く前に最新のAPIドキュメントを確認
- Cesium JS、React、TypeScript等

---

## 現在の状態

**フェーズ**: Phase 3 - PLATEAU活用

**動いているもの**:
- `cd app && npm run dev` で起動
- PLATEAU 3D都市モデル（中央区・南区・西区）
- ヒグマ出没データ318件
- 逃げやすさヒートマップ（建物密度に基づく安全度の可視化）
- 避難場所スコア（最寄り建物までの距離表示・色分け）

**完了済み**:
- Phase 1-2: 環境構築、PLATEAU統合、ヒグマデータ統合
- Phase 2.5: 開発環境整備（Biome/husky）
- Phase 3: 逃げやすさヒートマップ
- Phase 4: 避難場所スコア

---

## 完了したタスク

### 3.1-3.2 逃げやすさヒートマップ ✅ 完了

> 「逃げ込む場所があるか」を全体感で可視化

- [x] グリッドベースの安全度データ作成（`safety-grid.json`）
- [x] Cesium RectangleGraphicsでヒートマップ表示
- [x] 緑（安全）→黄（注意）→赤（危険）のグラデーション
- [x] 表示切り替えボタン・凡例パネル

### 4. 避難場所スコア ✅ 完了

> 出没地点から最寄り建物までの距離を計算・表示

- [x] OSM Overpass APIで札幌市の建物データ取得（82,017件）
- [x] 最寄り建物距離の計算ロジック（Haversine距離）
- [x] マーカークリック時に距離を表示（ポップアップ）
- [x] 距離に応じたマーカー色分け（緑:50m以内、黄:50-200m、赤:200m超）

**技術メモ**:
- 建物データ: `buildings-nearby.json`（OSMから取得、ヒグマ出没地点1km以内）
- 距離計算: `utils/evacuationScore.ts` の `findNearestBuildingDistance()`
- 色分け基準: 50m以内=安全、50-200m=注意、200m超=危険

---

## 技術スタック

- **フロントエンド**: TypeScript + React + Vite
- **3D可視化**: Cesium JS + Resium
- **データ**: 3D Tiles（PLATEAU）、JSON（ヒグマデータ）
- **ホスティング**: Cesium ion（3D Tiles配信）

---

## 技術的な学び

### PLATEAU 3D Tilesが浮いて見える問題と解決策

**問題**: PLATEAUの建物がCesiumで表示すると地面から浮いて見える

**原因**: 楕円体高 vs ジオイド高（標高）の違い
- Cesiumは**WGS84楕円体**を基準に高さを計算
- PLATEAUは**標高（ジオイド高）** = 東京湾平均海面基準で建物を配置
- 日本ではジオイド高が約36〜42mあるため、地形データがないと建物が浮く

**解決策**:
1. **Cesium World Terrain を使用** - 地形を標高で描画するため、PLATEAU建物と整合する
2. **depthTestAgainstTerrain を有効化** - 地形に対する深度テストで正確な表示
3. **ベースマップをOpenStreetMapに変更** - 衛星画像の建物と3D建物の重複を回避

**実装** (`MapPage.tsx`):
```typescript
// 地形データを使用
const worldTerrain = Terrain.fromWorldTerrain();

// Viewerに設定
<Viewer
  terrain={worldTerrain}
  baseLayer={new ImageryLayer(osmImageryProvider)}
>

// 深度テストを有効化（useEffectで設定）
viewer.scene.globe.depthTestAgainstTerrain = true;
```

---

## 環境変数

`app/.env.example` を参照してCesium ionトークンとアセットIDを設定。

---

## Git コミットルール

- 短い英語のコミットメッセージ（命令形、50文字以内）
- Co-Authored-By や絵文字は追加しない
- `/commit` コマンドを使用

---

## 参照ドキュメント

- `docs/spec.md` - 機能仕様
- `docs/data-sources.md` - データソースとライセンス

---

## 別のPCで作業を再開する手順

```bash
git clone https://github.com/newtaro24/pj-plateau-kumap.git
cd pj-plateau-kumap
npm install && cd app && npm install && cd ..
cp app/.env.example app/.env  # トークンを設定
cd app && npm run dev
```

---

**更新履歴**:
- 2025-12-23: Phase 4完了（避難場所スコア実装、OSM建物データ統合）
- 2025-12-22: Phase 3完了（逃げやすさヒートマップ実装）
- 2025-12-16: Phase 3開始、ドキュメント整理・統合
