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

**完了済み**:
- Phase 1-2: 環境構築、PLATEAU統合、ヒグマデータ統合
- Phase 2.5: 開発環境整備（Biome/husky）

---

## 次のタスク

### 3.1 避難場所スコア（最優先）

> 「逃げ込む場所があるか」を可視化

- [ ] Cesium 3D Tilesから建物座標を取得する方法の調査
- [ ] 出没地点から最寄り建物までの距離計算
- [ ] マーカークリック時に距離情報を表示

### 3.2 建物密度の可視化

> 「住宅の密集具合」を可視化

- [ ] グリッドごとの建物数を集計
- [ ] 密度ヒートマップの表示

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
- 2025-12-16: Phase 3開始、ドキュメント整理・統合
