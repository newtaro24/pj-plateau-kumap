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

**フェーズ**: Phase 5 - シンプル化

**動いているもの**:
- `cd app && npm run dev` で起動
- PLATEAU 3D都市モデル（中央区・南区・西区）
- ヒグマ出没データ318件（赤マーカー表示）
- ウォークモード（出没地点を1人称視点で歩く）
- ランディングページ（統計ダッシュボード）

**削除済み** (2025-12-25):
- 逃げやすさヒートマップ（ノイズになっていたため削除）
- 避難場所スコア（ノイズになっていたため削除）
- `safety-grid.json`, `buildings-nearby.json`, `evacuationScore.ts`

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

## スラッシュコマンド

- `/commit` - Gitコミット作成
- `/pr` - プルリクエスト作成
- `/memorize` - 重要な情報を記録

---

## サブエージェント

- `pr-reviewer` - プロダクト・UX観点レビュー（目的との整合性、ユーザー価値、優先度）
- `code-reviewer` - 技術観点レビュー（コード品質、セキュリティ、ベストプラクティス）

使い方: 「pr-reviewerでレビューして」「コードレビューして」など

---

## 参照ドキュメント

- `docs/spec.md` - 機能仕様
- `docs/data-sources.md` - データソースとライセンス
- `docs/plateau-tutorials.md` - PLATEAUチュートリアル（CesiumJS、React統合、防災事例）

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
- 2025-12-28: PLATEAUチュートリアル追加（docs/plateau-tutorials.md）
- 2025-12-25: ヒートマップ・避難場所スコアを削除（シンプル化）
- 2025-12-23: Phase 4完了（避難場所スコア実装、OSM建物データ統合）
- 2025-12-22: Phase 3完了（逃げやすさヒートマップ実装）
- 2025-12-16: Phase 3開始、ドキュメント整理・統合
