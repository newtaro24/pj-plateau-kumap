# PLATEAU 開発チュートリアル

PLATEAUの公式チュートリアルから抽出した開発に必要な知識をまとめたドキュメント。

---

## 目次

1. [PLATEAUの概要](#1-plateauの概要)
2. [3D都市モデルデータの基本](#2-3d都市モデルデータの基本)
3. [LOD（詳細度）の理解](#3-lod詳細度の理解)
4. [CityGMLの構造](#4-citygmlの構造)
5. [PLATEAU VIEW](#5-plateau-view)
6. [CesiumJSでの活用](#6-cesiumjsでの活用)
6.5. [PLATEAU配信サービス vs Cesium ion](#65-plateau配信サービス-vs-cesium-ion) ⭐ New
7. [CesiumJS + React統合](#7-cesiumjs--react統合)
8. [データ変換](#8-データ変換)
9. [地理空間情報の紐づけ](#9-地理空間情報の紐づけ)
10. [災害リスク可視化](#10-災害リスク可視化)
11. [防災関連事例](#11-防災関連事例)
12. [リンク集](#12-リンク集)

---

## 1. PLATEAUの概要

**出典**: TOPIC 1

### PLATEAUとは

国土交通省が主導する、日本全国の3D都市モデルを整備・活用・オープンデータ化するプロジェクト。

### 8つのデータカテゴリ

| カテゴリ | 内容 | フォルダ接頭辞 |
|---------|------|---------------|
| **建築物** | 住宅・商業施設 | `bldg` |
| **道路** | 車道・歩道 | `tran` |
| **都市計画** | 用途地域・地区境界 | `urf` |
| **土地利用** | 住居・商業・工業・農業 | `luse` |
| **災害リスク** | 浸水区域・土砂災害 | `fld` |
| **都市設備** | 街灯・信号・ベンチ | `frn` |
| **植生** | 樹木・生垣 | `veg` |
| **地形** | 標高・起伏 | `dem` |

### GISの基本概念

- **ベースマップ**: 行政界、道路、住所などの背景地図
- **ベクターデータ**: 点・線・面・立体の幾何形状（空間計算可能）
- **ラスターデータ**: 航空写真・衛星画像（ピクセルベース）
- **属性情報**: 建物高さ、構造種別、用途などのメタデータ

---

## 2. 3D都市モデルデータの基本

**出典**: TOPIC 3

### データ入手先

**G空間情報センター**: https://www.geospatial.jp/

- 商用利用含め無料で利用可能
- CityGML形式が標準
- 変換済みフォーマットも配布（3D Tiles, FBX, OBJ, GeoJSON等）

### ファイル構成

ZIPファイルに以下が含まれる:

```
├── 仕様書/              # 標準仕様と自治体独自拡張
├── 索引図/              # メッシュコード範囲図
├── bldg/               # 建築物データ
├── tran/               # 道路データ
├── dem/                # 地形データ
├── fld/                # 浸水区域データ
├── luse/               # 土地利用データ
└── urf/                # 都市計画データ
```

### メッシュコードシステム

日本標準地域メッシュを使用。**3次メッシュで約1km四方**に分割。

必要な地域のみダウンロード可能。

### 属性の自治体差異

**重要**: 属性情報は自治体により異なる。各データセットに属性一覧が付属。

---

## 3. LOD（詳細度）の理解

**出典**: TOPIC 3

### LODレベル比較

| LOD | 名称 | 表現内容 | 用途 |
|-----|------|---------|------|
| **LOD0** | 平面投影 | 屋根縁または地表面の2D輪郭 | 平面図、GIS分析 |
| **LOD1** | 単純立体 | 箱型の3Dソリッド | 俯瞰表示、都市全体可視化 |
| **LOD2** | 詳細立体 | 壁・屋根・床を区別した3D | 景観シミュレーション |
| **LOD3** | 高詳細 | 窓・ドアなどの詳細形状 | 詳細シミュレーション |

### LOD2の境界面タイプ

```
bldg:WallSurface      - 外壁
bldg:RoofSurface      - 屋根
bldg:GroundSurface    - 地面接触面
bldg:OuterCeilingSurface - 外部天井
bldg:OuterFloorSurface   - 外部床
```

### 精度基準

地図情報レベル2500準拠:
- 水平精度: 1.75m以内（標準偏差）
- 高さ精度: 0.66m以内（標準偏差）

---

## 4. CityGMLの構造

**出典**: TOPIC 3

### XML名前空間

```xml
xmlns:gml="..."   <!-- 幾何形状 -->
xmlns:core="..."  <!-- 共通機能 -->
xmlns:bldg="..."  <!-- 建築物 -->
xmlns:app="..."   <!-- テクスチャ -->
xmlns:uro="..."   <!-- 日本独自拡張 -->
```

### 基本構造

```xml
<core:CityModel>
  <!-- 座標系・範囲 -->
  <gml:boundedBy>
    <gml:Envelope srsName="EPSG:6697">
      <gml:lowerCorner>...</gml:lowerCorner>
      <gml:upperCorner>...</gml:upperCorner>
    </gml:Envelope>
  </gml:boundedBy>

  <!-- テクスチャ情報 -->
  <app:appearanceMember>...</app:appearanceMember>

  <!-- 地物オブジェクト -->
  <core:cityObjectMember>
    <bldg:Building gml:id="...">
      <!-- 属性・幾何形状 -->
    </bldg:Building>
  </core:cityObjectMember>
</core:CityModel>
```

### 属性情報の種類

- **gml:id**: 一意識別子（バージョン間で変更の可能性あり）
- **汎用属性**: `gen:stringAttribute`, `gen:measureAttribute`
- **コードリスト**: 数値コード→説明文の外部辞書参照
- **構造データ**: 高さ、階数、建築年など

---

## 5. PLATEAU VIEW

**出典**: TOPIC 2

### 概要

ブラウザで動作するGISビューア。WebGL技術で軽量・高速。

**URL**: https://plateauview.mlit.go.jp/

### 5つの操作モード

| モード | ショートカット | 機能 |
|--------|---------------|------|
| 地図移動 | H | マウスドラッグで地図操作 |
| 地物選択 | V | 個別地物の選択・属性確認 |
| 歩行者 | P | Street View連携による没入閲覧 |
| 作図 | G | 3D地物の作成 |
| 空間ID抽出 | - | ボクセル単位での属性取得 |

### 主要機能

- **データ追加**: エリア検索または地物カタログから
- **色分け表示**: 計測高さ（連続値）や用途（離散値）で自動色分け
- **データ取得**: 空間IDやメッシュコードからCityGMLダウンロード（最大9メッシュ）

---

## 6. CesiumJSでの活用

**出典**: TOPIC 6

### セットアップ

```html
<script src="https://cesium.com/downloads/cesiumjs/releases/1.82/Build/Cesium/Cesium.js"></script>
<link href="https://cesium.com/downloads/cesiumjs/releases/1.82/Build/Cesium/Widgets/widgets.css" rel="stylesheet">
```

### 3D Tiles読み込み

```javascript
const viewer = new Cesium.Viewer('cesiumContainer');

// 3D Tilesを追加
const tileset = viewer.scene.primitives.add(
  new Cesium.Cesium3DTileset({
    url: 'https://assets.cms.plateau.reearth.io/assets/.../tileset.json'
  })
);

// カメラを自動移動
viewer.flyTo(tileset);
```

### オルソ画像追加

```javascript
const viewer = new Cesium.Viewer('cesiumContainer', {
  imageryProvider: new Cesium.UrlTemplateImageryProvider({
    url: 'https://api.plateauview.mlit.go.jp/tiles/plateau-ortho-2023/{z}/{x}/{y}.png'
  })
});
```

### 地形データ統合

```javascript
Cesium.Ion.defaultAccessToken = '[token]';

const viewer = new Cesium.Viewer('cesiumContainer', {
  terrainProvider: new Cesium.CesiumTerrainProvider({
    url: Cesium.IonResource.fromAssetId(2488101)  // 5-10mメッシュ
  })
});
```

### 重要なAPI

| メソッド | 用途 |
|---------|------|
| `viewer.scene.primitives.add()` | 3D Tiles追加 |
| `viewer.flyTo(tileset)` | カメラ自動移動 |
| `Cesium.Cartesian3.fromDegrees()` | 座標指定 |

### データ取得先

- **3D Tiles URL検索**: https://api.plateauview.mlit.go.jp/datacatalog/plateau-datasets
- **オルソ画像**: plateau-ortho-2023 (zoom 19まで、約30cm精度)

---

## 6.5. PLATEAU配信サービス vs Cesium ion

### 概要

PLATEAUデータを3D Tilesとして利用する方法は主に2つある。

| 方式 | 説明 |
|------|------|
| **PLATEAU配信サービス** | 国交省が提供する無料の配信サービス。公式データをそのまま利用。 |
| **Cesium ion** | Cesiumが提供するクラウドホスティング。自分のデータをアップロード。 |

### 比較表

| 観点 | PLATEAU配信サービス | Cesium ion |
|------|---------------------|------------|
| **データアップロード** | 不要 | 必要 |
| **最新データ反映** | 自動（PLATEAUの更新に追従） | 手動で再アップロード |
| **コスト** | 無料 | 有料（無料枠5GB/月） |
| **カスタマイズ** | 不可（公式データそのまま） | 可能（データ加工後にアップロード） |
| **URL安定性** | 変更の可能性あり | 自分で管理 |
| **パフォーマンス** | 公式インフラ | Cesiumの最適化済みインフラ |

### 使い分けの判断基準

**PLATEAU配信サービスを使うべき場合**:
- PLATEAUデータをそのまま使いたい
- 最新データを自動で反映したい
- コストを抑えたい
- 複数都市のデータを手軽に使いたい

**Cesium ionを使うべき場合**:
- 独自データを配信したい（自社の建物モデル、点群データなど）
- PLATEAUデータを加工して使いたい（色変更、フィルタリング、属性追加）
- PLATEAUにない都市のデータを使いたい
- URL安定性を自分で管理したい

### PLATEAU配信サービスの使い方

**データカタログAPI**（推奨）:
```bash
# 全データセット取得
curl https://api.plateauview.mlit.go.jp/datacatalog/plateau-datasets

# jqで札幌市の建物データを抽出
curl -s https://api.plateauview.mlit.go.jp/datacatalog/plateau-datasets | \
  jq '.datasets | map(select(.city_code == "01100" and .type_en == "bldg" and .format == "3D Tiles"))'
```

**CesiumJSでの読み込み**:
```javascript
// PLATEAU配信サービスから直接読み込み（Cesium ionアセット不要）
const tileset = viewer.scene.primitives.add(
  new Cesium.Cesium3DTileset({
    url: 'https://assets.cms.plateau.reearth.io/assets/.../tileset.json'
  })
);
```

### 参考リンク

| 名称 | URL |
|------|-----|
| PLATEAU配信サービス チュートリアル | https://github.com/Project-PLATEAU/plateau-streaming-tutorial |
| データカタログAPI | https://api.plateauview.mlit.go.jp/datacatalog/plateau-datasets |
| Cesium ion公式 | https://cesium.com/learn/ion/ |
| Cesium Japan 3D Buildings | https://cesium.com/blog/2024/06/03/japan-3d-buildings/ |

---

## 7. CesiumJS + React統合

**出典**: TOPIC 6

### 技術スタック

- Cesium v1.98, React v18, Next.js v12, TypeScript v4.8

### Viewerコンポーネント

```typescript
import { createContext, useLayoutEffect, useRef, useState } from 'react'
import { Viewer as CesiumViewer } from 'cesium'

export const ViewerContext = createContext<CesiumViewer | undefined>(undefined)

export function Viewer({ id, children }) {
  const ref = useRef<HTMLDivElement>(null)
  const [viewer, setViewer] = useState<CesiumViewer>()

  useLayoutEffect(() => {
    if (!ref.current) return
    const viewer = new CesiumViewer(ref.current)
    setViewer(viewer)

    return () => {
      viewer.destroy()  // 必ずクリーンアップ
    }
  }, [id])

  return (
    <ViewerContext.Provider value={viewer}>
      <div ref={ref} />
      {viewer && children}
    </ViewerContext.Provider>
  )
}
```

### Tilesetコンポーネント

```typescript
import { useContext, useEffect, useState } from 'react'
import { Cesium3DTileset } from 'cesium'
import { ViewerContext } from './Viewer'

export function PlateauTileset({ url, flyTo = false }) {
  const viewer = useContext(ViewerContext)
  const [tileset, setTileset] = useState<Cesium3DTileset>()

  useEffect(() => {
    if (!viewer) return

    const tileset = new Cesium3DTileset({ url })
    viewer.scene.primitives.add(tileset)
    setTileset(tileset)

    return () => {
      // 親Viewerが破棄されていないか確認
      if (!viewer.isDestroyed()) {
        viewer.scene.primitives.remove(tileset)
      }
    }
  }, [url, viewer])

  useEffect(() => {
    if (flyTo && viewer && tileset) {
      void viewer.flyTo(tileset)
    }
  }, [flyTo, viewer, tileset])

  return null
}
```

### 重要なポイント

1. **クリーンアップ必須**: `useEffect`の戻り値で必ずリソース解放
2. **isDestroyed()確認**: Reactは親→子の順で破棄するため確認必要
3. **useLayoutEffect**: DOM操作は同期的に実行

### ジオイド高問題と解決策

日本の建物は標高ベースで配置されるため、地形なしだと約36.7m浮く。

```typescript
// 解決策: 地形プロバイダを使用
viewer.terrainProvider = new CesiumTerrainProvider({
  url: IonResource.fromAssetId(2488101)
})

// 深度テスト有効化
viewer.scene.globe.depthTestAgainstTerrain = true
```

---

## 8. データ変換

**出典**: TOPIC 4, 12

### FME Form（商用ツール）

CityGMLから各種フォーマットへの変換:
- FBX, OBJ, IFC, GML変種
- Workbenchでパイプライン構築

### Three.js用変換（Blender使用）

1. FBX/OBJをインポート
2. スケール100設定（メートル単位）
3. 向き設定（Y-forward, Z-up）
4. メッシュ中心を原点に移動
5. glTF binary (.glb) でエクスポート

### Three.js基本実装

```javascript
// シーン、カメラ、レンダラー初期化
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// glTFローダー
const loader = new GLTFLoader();
loader.load('model.glb', (gltf) => {
  scene.add(gltf.scene);
});

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
```

---

## 9. 地理空間情報の紐づけ

**出典**: TOPIC 27

### PLATEAU DataLinker

ブラウザで動作するオープンソースツール。CityGMLに別の地理空間情報を紐づけ。

### マッチング方式

| 方式 | 説明 |
|------|------|
| 経緯度ベース | 建物座標が指定地点を内包しているか判定 |
| 属性ベース | 住所、建物IDなどで完全一致 |

### 対応フォーマット

- **入力**: GML, XML, CSV, JSON
- **出力**: CityGML, CSV

### 活用例

1. **データ拡張**: オープンデータ（施設情報、災害リスク等）と建物データの結合
2. **ノーコード開発**: CSV出力 → Glideなどでアプリ化
3. **条件判定可視化**: 「低層階に車椅子対応トイレがあるビル」など

### 注意点

- UTF-8文字コード必須
- 経度・緯度はスペース区切り形式

---

## 10. 災害リスク可視化

**出典**: TOPIC 21

### QGISでの分析手法

**必要環境**:
- QGIS 3.28 LTR
- PLATEAU QGISプラグイン v0.0.2

### 主要分析

| 分析 | 方法 |
|------|------|
| 土地利用面積計算 | `luse`フォルダのCityGMLを`class`属性でグループ化 |
| 災害リスク可視化 | 建物属性の津波・浸水リスクを色分け表示 |
| 避難所距離計算 | 最近傍結合で建物→避難所の直線距離算出 |

### 技術的注意点

1. **座標系変換**: 面積計算には投影座標系（EPSG:6676等）への変換必須
2. **ジオメトリ修復**: 無効なジオメトリは計算前に修復

---

## 11. 防災関連事例

### 建物振動シミュレーション (uc24-03)

**技術スタック**:
- Python, Vue.js, Deck.GL
- FastAPI, GDAL, AWS

**アーキテクチャ**:
- 広域: DIAS連携、スーパーコンピュータのIES使用
- 狭域: wallstatエンジン、個別要素法で倒壊挙動再現

**データ活用**:
- 建築物LOD1モデル（位置、高さ、階数、構造種別、築年代、床面積）
- 質量・剛性・減衰定数を自動計算

### 延焼シミュレーション (uc23-26)

**技術スタック**:
- CesiumJS（3D可視化）
- 国総研「市街地火災総合対策支援ツール」

**データ活用**:
- 3D都市モデル（高さ、構造種別、建築年）
- 地形・標高、風向・風速、植生情報

**知見**:
- 標高を反映すると延焼速度が変化
- 傾斜地では「地面」を耐火構造として追加可能

---

## 12. リンク集

### 公式リソース

| 名称 | URL |
|------|-----|
| PLATEAU公式サイト | https://www.mlit.go.jp/plateau/ |
| PLATEAU VIEW | https://plateauview.mlit.go.jp/ |
| G空間情報センター | https://www.geospatial.jp/ |
| PLATEAU配信サービスAPI | https://api.plateauview.mlit.go.jp/datacatalog/plateau-datasets |
| Project PLATEAU GitHub | https://github.com/Project-PLATEAU |

### ツール

| 名称 | 用途 |
|------|------|
| PLATEAU DataLinker | 地理空間情報の紐づけ |
| PLATEAU QGISプラグイン | QGISでのCityGML読み込み |
| PLATEAU SDK for Unity | Unity向け開発キット |

### 外部ドキュメント

| 名称 | URL |
|------|-----|
| Cesium公式 | https://cesium.com/learn/ |
| Resium (React + Cesium) | https://resium.reearth.io/ |
| Three.js公式 | https://threejs.org/docs/ |

---

## このプロジェクトへの適用

### 現在の実装との対応

| チュートリアル内容 | 本プロジェクト |
|-------------------|---------------|
| Viewer + useEffect | `MapPage.tsx` で実装済み |
| 地形プロバイダ | Cesium World Terrain使用 |
| depthTestAgainstTerrain | 有効化済み |
| PLATEAU白地図タイル | ベースマップとして使用 |
| 3D Tiles (LOD1) | 札幌市全10区をPLATEAU配信サービスから直接読み込み |
| PLATEAU配信サービス | Cesium ionの代わりに使用（2026-01-04〜） |

### 参考にできるパターン

1. **コンポーネント分離**: Tileset、Camera、Lightingを個別コンポーネントに
2. **地理空間情報紐づけ**: ヒグマ出没データと建物データの連携にDataLinker参考
3. **災害リスク可視化**: 出没リスクの色分け表示にQGIS分析手法を応用

---

**作成日**: 2025-12-28
**更新日**: 2026-01-04（PLATEAU配信サービス vs Cesium ionセクション追加）
**ソース**: PLATEAU公式チュートリアル TOPIC 1-4, 6, 12, 17, 21, 27, 活用事例 uc23-26, uc24-03
