# データソースとライセンス情報

このプロジェクトで使用しているデータの出典とライセンス情報を記載します。

---

## 📊 使用データ一覧

### 1. ヒグマ出没情報データ

**データ名**: 札幌市内のヒグマ出没情報
**提供元**: 札幌市環境局
**データソース**: [札幌市オープンデータプラットフォーム（CKAN）](https://ckan.pf-sapporo.jp/dataset/sapporo_bear_appearance)
**ダウンロードURL**: https://ckan.pf-sapporo.jp/dataset/sapporo_bear_appearance

**ライセンス**: [クリエイティブ・コモンズ 表示 4.0 国際（CC BY 4.0）](https://creativecommons.org/licenses/by/4.0/deed.ja)

**利用規約**:
- 適切なクレジット表記が必要
- 改変・商用利用可能
- 再配布時もライセンス情報を明記

**クレジット表記**:
```
データ提供: 札幌市環境局
出典: 札幌市オープンデータプラットフォーム
ライセンス: CC BY 4.0
```

**データ概要**:
- 札幌市内におけるヒグマの目撃情報や痕跡発見などの記録
- 日付、時刻、区、出没場所、緯度・経度、状況（目撃/足跡/フン等）を含む
- 2017年〜2025年のデータが利用可能
- 本プロジェクトでは2025年データ（318件）を使用

**公式情報ページ**:
- [札幌市ヒグマ出没情報（公式）](https://www.city.sapporo.jp/kurashi/animal/choju/kuma/syutsubotsu/index.html)

---

### 2. PLATEAUデータ（予定）

**データ名**: PLATEAU 札幌市3D都市モデル
**提供元**: 国土交通省
**データソース**: [G空間情報センター](https://www.geospatial.jp/ckan/dataset/plateau)

**ライセンス**: [政府標準利用規約（第2.0版）](https://www.mlit.go.jp/plateau/libraries/technical-reports/)

**利用規約**:
- 出典を明示すれば、複製・加工・頒布・送信が可能
- 商用利用可能
- 第三者の権利を侵害しないこと

**クレジット表記**:
```
データ提供: 国土交通省 Project PLATEAU
出典: G空間情報センター
ライセンス: 政府標準利用規約（第2.0版）
```

**データ概要**:
- 札幌市の3D都市モデル（建物、地形等）
- CityGML形式（3D Tilesに変換して使用）
- LOD（Level of Detail）に対応

**公式サイト**:
- [Project PLATEAU](https://www.mlit.go.jp/plateau/)

---

## 📝 データ利用のルール

### 本プロジェクトでの利用方針

1. **クレジット表記**
   - アプリケーション内にデータ提供元を明記
   - READMEにデータソースとライセンス情報を記載

2. **データの加工**
   - CSV → GeoJSON変換（scripts/csv-to-geojson.ts）
   - CityGML → 3D Tiles変換（PLATEAU GIS Converter使用）

3. **データの更新**
   - ヒグマ出没情報: 定期的に最新データを取得・更新
   - PLATEAUデータ: 年次更新を確認

4. **第三者への配布**
   - 本プロジェクトのソースコードを配布する際は、このドキュメントも含める
   - データのライセンス情報を必ず明記

---

## 🔗 関連リンク

- [Creative Commons Japan](https://creativecommons.jp/)
- [政府標準利用規約（第2.0版）](https://www.kantei.go.jp/jp/singi/it2/densi/kettei/gl2_betten_1.pdf)
- [札幌市オープンデータカタログ](https://ckan.pf-sapporo.jp/)
- [Project PLATEAU](https://www.mlit.go.jp/plateau/)

---

**最終更新**: 2025-11-14
**確認者**: Claude Code
