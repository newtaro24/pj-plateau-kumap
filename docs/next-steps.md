# 次回やること - PLATEAUデータ統合

**最終更新**: 2025-11-14

## 🎯 次回のタスク: Cesium ionで3D都市モデル統合

### 準備完了しているもの ✅

- [x] 札幌市PLATEAUデータダウンロード済み（2.2GB）
- [x] 中央区データを抽出・ZIP化済み（28MB）
  - ファイル: `/Users/nakano.shintaro/project/pj-plateau-kumap/plateau-data/chuo-ku_lod1.zip`
- [x] Cesium ion使用を決定

---

## 📋 次回の作業手順（30-40分）

### Step 1: Cesium ionアカウント作成（5分）

1. **URL**: https://ion.cesium.com/signup
2. Googleアカウントでサインアップ（推奨）
3. ダッシュボードに移動: https://ion.cesium.com/assets

---

### Step 2: 中央区データをアップロード（10分）

#### アップロード手順

1. **「Add data」**ボタンをクリック

2. **ファイルをドラッグ&ドロップ**:
   ```
   /Users/nakano.shintaro/project/pj-plateau-kumap/plateau-data/chuo-ku_lod1.zip
   ```

3. **設定**:
   - Type: `3D Tiles`（自動検出される）
   - Name: `Sapporo Chuo-ku LOD1`
   - Description: `札幌市中央区 建物モデル LOD1（2020年度）`

4. **「Upload」**をクリック

5. **処理待ち**:
   - ステータス: `Processing` → `Complete`（5-10分）
   - この間にStep 3の準備

---

### Step 3: Access Token取得（2分）

1. 右上のアイコンクリック → **「Access Tokens」**
2. **「Default」**トークンをコピー
   - または**「Create token」**で新規作成（推奨）
   - Name: `pj-plateau-kumap`
   - Scopes: `assets:read`のみでOK

**保存先**: `.env.local`ファイル（後で作成）

---

### Step 4: Asset ID取得（1分）

アップロード完了後：

1. アセット一覧から`Sapporo Chuo-ku LOD1`をクリック
2. URLから**Asset ID**を確認:
   ```
   https://ion.cesium.com/assets/123456
                                ^^^^^^
                              これがAsset ID
   ```

**保存先**: `.env.local`ファイル

---

### Step 5: アプリに統合（10分）

#### 5-1. 環境変数ファイル作成

```bash
# app/.env.local を作成
touch app/.env.local
```

内容:
```env
VITE_CESIUM_ION_TOKEN=your_token_here
VITE_CESIUM_ASSET_ID=123456
```

#### 5-2. App.tsxを編集

```tsx
// Cesium ionの設定を追加
import { Ion, IonResource } from "cesium";

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN;

// Viewer内に3D Tilesを追加
import { Cesium3DTileset } from "resium";

<Viewer>
  <CameraFlyTo destination={sapporoPosition} duration={0} />

  {/* 3D都市モデル（中央区）*/}
  <Cesium3DTileset
    url={IonResource.fromAssetId(
      Number(import.meta.env.VITE_CESIUM_ASSET_ID)
    )}
  />

  {/* ヒグママーカー */}
  {bearSightings.map(...)}
</Viewer>
```

#### 5-3. .gitignoreに追加

```bash
# app/.gitignore に追加
.env.local
```

---

### Step 6: 動作確認（5分）

```bash
cd app
npm run dev
```

**確認ポイント**:
- ✅ 中央区の建物が3Dで表示される
- ✅ ヒグママーカーも同時に表示される
- ✅ カメラの位置・角度を調整

---

## 🔧 トラブルシューティング

### 3D Tilesが表示されない場合

1. **ブラウザコンソール確認**
   - `401 Unauthorized` → Tokenが間違っている
   - `404 Not Found` → Asset IDが間違っている
   - CORS Error → Cesium ionなら起こらないはず

2. **環境変数確認**
   ```tsx
   console.log('Token:', import.meta.env.VITE_CESIUM_ION_TOKEN);
   console.log('Asset ID:', import.meta.env.VITE_CESIUM_ASSET_ID);
   ```

3. **開発サーバー再起動**
   - 環境変数変更時は必須

---

## 📊 データ情報

### ダウンロード済みデータ

**場所**: `/Users/nakano.shintaro/project/pj-plateau-kumap/plateau-data/`

**ファイル構成**:
```
plateau-data/
├── sapporo_3dtiles_v4.zip (2.2GB) - 元データ
├── chuo-ku_lod1.zip (28MB) - アップロード用
└── 01100_sapporo-shi_city_2020_citygml_7_op_bldg_3dtiles_01101_chuo-ku_lod1/
    ├── tileset.json
    └── data/
        └── *.b3dm (176ファイル)
```

**各区のサイズ**:
- 中央区（chuo-ku）: 279MB
- 南区（minami-ku）: 407MB
- その他: 合計約2.2GB

---

## 🎨 将来の拡張

### 南区の追加（ヒグマ出没多いエリア）

同じ手順で：
```bash
zip -r minami-ku_lod1.zip 01100_sapporo-shi_city_2020_citygml_7_op_bldg_3dtiles_01106_minami-ku_lod1/
```

Cesium ionにアップロード → 新しいAsset ID取得 → 追加

### 全区の統合

無料枠（5GB）内で全区アップロード可能

---

## 📚 参考リンク

- **Cesium ion Dashboard**: https://ion.cesium.com/
- **Cesium ion Documentation**: https://cesium.com/learn/ion/
- **Resium Documentation**: https://resium.reearth.io/
- **PLATEAU G空間情報センター**: https://www.geospatial.jp/ckan/dataset/plateau-01100-sapporo-shi-2020

---

## 💡 Tips

### パフォーマンスチューニング

```tsx
<Cesium3DTileset
  url={...}
  maximumScreenSpaceError={16} // デフォルト16、小さくすると高品質・重い
  skipLevelOfDetail={true} // 高速化
/>
```

### カメラ位置の調整

中央区が見やすい位置:
```tsx
const chuokuPosition = Cartesian3.fromDegrees(
  141.35,  // 経度
  43.06,   // 緯度
  5000     // 高度（中央区を俯瞰）
);
```

---

**次回はここから始める！頑張ってください！** 🚀
