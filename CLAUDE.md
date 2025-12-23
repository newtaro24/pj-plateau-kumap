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
- ヒグマ出没データ318件（危険度別色分け）
- 逃げやすさヒートマップ（建物密度に基づく安全度の可視化）

**完了済み**:
- Phase 1-2: 環境構築、PLATEAU統合、ヒグマデータ統合
- Phase 2.5: 開発環境整備（Biome/husky）
- Phase 3: 逃げやすさヒートマップ

---

## 次のタスク

### 3.1-3.2 逃げやすさヒートマップ ✅ 完了

> 「逃げ込む場所があるか」を全体感で可視化

- [x] グリッドベースの安全度データ作成（`safety-grid.json`）
- [x] Cesium RectangleGraphicsでヒートマップ表示
- [x] 緑（安全）→黄（注意）→赤（危険）のグラデーション
- [x] 表示切り替えボタン・凡例パネル

**技術メモ**:
- グリッドサイズ: 0.02度（約2km四方）
- 安全度: 0-1の値（1が最も安全）
- 色計算: `getSafetyColor()` 関数で安全度に応じた色を返す

---

## 技術スタック

- **フロントエンド**: TypeScript + React + Vite
- **3D可視化**: Cesium JS + Resium
- **データ**: 3D Tiles（PLATEAU）、JSON（ヒグマデータ）
- **ホスティング**: Cesium ion（3D Tiles配信）

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
- 2025-12-22: Phase 3完了（逃げやすさヒートマップ実装）
- 2025-12-16: Phase 3開始、ドキュメント整理・統合
