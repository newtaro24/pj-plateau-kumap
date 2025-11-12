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

**フェーズ**: Phase 1 - コンセプト策定・技術調査

**完了したこと**:
- プロジェクトコンセプト整理
- PLATEAU技術調査完了
- 技術スタック決定（TypeScript + React + Cesium JS）
- ドキュメント構造整理完了
- Context7 MCP設定完了

**次にやること**:
1. Vite + React + TypeScript + Cesium JS環境のセットアップ
2. 札幌市中心の3D地球儀表示（Hello World）
3. PLATEAUデータとヒグマデータの入手方法調査

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

**更新履歴**:
- 2025-11-12: プロジェクト開始、メモリファイル整備、Context7 MCP設定、Gitコミットルール設定
