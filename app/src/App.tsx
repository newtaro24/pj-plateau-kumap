import { Viewer, Entity, CameraFlyTo, Cesium3DTileset } from "resium";
import { Cartesian3, Color, Ion, IonResource } from "cesium";
import { DataSourceCredit } from "./components/DataSourceCredit";
import bearSightingsData from './data/bear_sightings_2025.json';
import './App.css'

// Cesium ionのアクセストークンを設定
Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN || '';

interface BearSighting {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    date: string;
    time: string;
    ward: string;
    location: string;
    situation: string;
    dangerLevel: string;
  };
}

function App() {
  // 札幌市の座標 (緯度: 43.0642°N, 経度: 141.3545°E, 高度: 10000m)
  const sapporoPosition = Cartesian3.fromDegrees(141.3545, 43.0642, 10000);

  // 実際のヒグマ出没データ（静的インポート）
  const bearSightings = bearSightingsData.features as BearSighting[];

  // 危険度に応じた色とサイズを返す関数
  const getDangerStyle = (level: string) => {
    switch (level) {
      case "high":
        return { color: Color.RED, size: 20 };
      case "medium":
        return { color: Color.YELLOW, size: 16 };
      case "low":
        return { color: Color.LIME, size: 12 };
      default:
        return { color: Color.WHITE, size: 10 };
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Viewer
        full
        timeline={false}
        animation={false}
        homeButton={false}
        navigationHelpButton={false}
        baseLayerPicker={false}
        geocoder={false}
        sceneModePicker={false}
      >
        <CameraFlyTo destination={sapporoPosition} duration={0} />

        {/* PLATEAU 3D都市モデル（札幌市中央区） */}
        {import.meta.env.VITE_CESIUM_ASSET_ID && (
          <Cesium3DTileset
            url={IonResource.fromAssetId(
              Number(import.meta.env.VITE_CESIUM_ASSET_ID)
            )}
          />
        )}

        {/* ヒグマ出没マーカー */}
        {bearSightings.map((sighting, index) => {
          const { coordinates } = sighting.geometry;
          const { date, time, ward, location, situation, dangerLevel } = sighting.properties;
          const style = getDangerStyle(dangerLevel);

          return (
            <Entity
              key={index}
              name={`${ward} - ${date} ${time}`}
              description={`ヒグマ出没情報\n日時: ${date} ${time}\n場所: ${location}\n状況: ${situation}\n危険度: ${dangerLevel}`}
              position={Cartesian3.fromDegrees(coordinates[0], coordinates[1])}
              point={{
                pixelSize: style.size,
                color: style.color,
                outlineColor: Color.WHITE,
                outlineWidth: 2,
              }}
            />
          );
        })}
      </Viewer>

      <DataSourceCredit
        dataSourceName="札幌市オープンデータ"
        dataSourceUrl="https://ckan.pf-sapporo.jp/dataset/sapporo_bear_appearance"
        license="CC BY 4.0"
      />
    </div>
  )
}

export default App
