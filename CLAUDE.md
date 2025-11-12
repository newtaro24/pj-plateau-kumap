# pj-plateau-kumap - Claude Code メモリ

**プロジェクト**: 札幌市民のための実践的なヒグマ危険度3Dマップ&シミュレーターアプリ
**目的**: アーバンデータチャレンジ2025応募作品
**コンセプト**: 「不意のヒグマとの遭遇に怯えている人の助けになる」

---

## 🚨 Claude Code への重要な指示

**ライブラリを使う際は必ずContext7 MCPを使用すること**（Cesium JS、React、TypeScript等）
- コードを書く前に最新のAPIドキュメントを確認
- 学習データに頼らず、現在のAPI構文を検証
- 最新のベストプラクティスを確認

---

## 現在の状態（最重要）

@docs/current-state.md

**フェーズ**: Phase 2 - 基本機能実装開始

**完了したこと**:
- Phase 1完了（コンセプト、技術調査、技術スタック決定）
- Vite + React + TypeScript + Cesium JS環境構築完了
- 札幌市中心の3D地球儀表示（動作確認OK）
- テスト用ヒグママーカー3箇所追加（円山公園周辺、藻岩山麓、南区山林地帯）
- マーカークリックで情報表示機能実装

**現在動いているもの**:
- `cd app && npm run dev` で開発サーバー起動
- 札幌市の3D衛星画像マップ
- 3つの赤いヒグマ目撃マーカー（クリックで情報表示）

**次にやること（優先度順）**:
1. マーカーのスタイル改善（アイコン、色分け）
2. カメラ位置の最適化（より地表に近づける）
3. 実際のヒグマデータ調査・統合
4. PLATEAUデータ統合準備

---

## 決定事項

### 技術スタック
- **フロントエンド**: TypeScript + React (Vite)
- **3D可視化**: Cesium JS
- **データ形式**: 3D Tiles（PLATEAU）、GeoJSON（ヒグマデータ）
- **変換ツール**: PLATEAU GIS Converter

### 開発方針
- Web開発（ブラウザで動作、共有しやすい）
- PLATEAUデータを触りながらアイデアを膨らませる
- まず動くものを作ることを優先

---

## 詳細ドキュメント

プロジェクトの詳細情報は以下のファイルに記載：

- **TODO・ロードマップ**: @docs/todo-roadmap.md
- **機能仕様**: @docs/spec.md
- **技術詳細**: @docs/tech-stack.md
- **調査ログ**: @docs/research.md

---

## 重要な知識

### PLATEAUについて
- 国土交通省の3D都市モデル整備プロジェクト
- データ形式: CityGML（標準） → 3D Tiles/glTF（Web用に変換）
- Unity/Unreal SDKもあるが、今回はWeb開発を選択

### Cesium JSについて
- 3D地球儀・地理空間データ可視化ライブラリ
- 3D Tiles、地理座標系をネイティブサポート
- 大規模データもLOD（Level of Detail）で効率的に処理

### 開発フロー（想定）
1. 札幌市3D都市モデル（CityGML）のダウンロード
2. PLATEAU GIS Converterで3D Tilesに変換
3. Cesium JSで読み込み・可視化
4. ヒグマ出没データ（GeoJSON）をオーバーレイ
5. ヒートマップ・シミュレーション機能実装

---

## 設定済みMCPサーバー

### Context7（稼働中）
- **目的**: Cesium JS、React、TypeScript等の最新ドキュメント提供
- **コマンド**: `npx -y @upstash/context7-mcp`
- **ステータス**: ✓ 接続中
- **メリット**: 古いコード提案を防ぎ、最新のAPI使用を保証

MCPステータス確認: `claude mcp list`

---

## よく使うコマンド

**MCP管理**:
- `claude mcp list` - インストール済みMCPサーバー一覧
- `claude mcp add <名前> -- <コマンド>` - 新規MCPサーバー追加

**プロジェクトコマンド**:
- `/commit` - Gitコミットを作成（プロジェクトのコミットルールに従う）
- `/memorize` - 重要な情報をドキュメントに記録（作業終了時・重要な決定をした時に使用）

---

## Git コミットルール

**必ず `/commit` コマンドを使用してコミットすること**

### ルール
- 短い英語のコミットメッセージ（命令形、50文字以内）
- 小さく集中したコミット（単一の論理的な変更）
- Co-Authored-By フッターは追加しない
- 絵文字や "Generated with Claude Code" メッセージは追加しない
- シンプルに `git commit -m "message"` 形式を使う

### 良いメッセージ例
- "Add initial documentation"
- "Setup project structure"
- "Configure Cesium JS"

---

## コーディング規約

### コードを書く前に
- **必ずContext7 MCPを使用**して以下の最新ドキュメントを取得:
  - Cesium JSのAPIとベストプラクティス
  - React 18+のパターンとフック
  - TypeScriptの最新機能
  - 使用する全てのライブラリ
- 学習データに頼らず、必ず現在のAPI構文を検証すること

### コードスタイル
（実装開始後に具体的な規約を追加予定）

---

## 別のPCで作業を再開する手順

1. **リポジトリをクローン**:
   ```bash
   git clone https://github.com/newtaro24/pj-plateau-kumap.git
   cd pj-plateau-kumap
   ```

2. **依存関係をインストール**:
   ```bash
   cd app
   npm install
   ```

3. **開発サーバー起動**:
   ```bash
   npm run dev
   ```

4. **Claude Codeで作業開始**:
   - このファイル（CLAUDE.md）は自動的に読み込まれる
   - さらに `/memorize` コマンドを実行して重要情報をメモリに記録
   - `docs/current-state.md` で詳細な状態を確認

5. **Context7 MCPを設定**（まだの場合）:
   ```bash
   claude mcp add context7 -- npx -y @upstash/context7-mcp
   ```

---

**更新履歴**:
- 2025-11-12 17:00: プロジェクト開始、メモリファイル整備、Context7 MCP設定、Gitコミットルール設定
- 2025-11-12 18:50: Phase 2開始、Cesium動作確認、ヒグママーカー実装完了
