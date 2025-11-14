import { Viewer, Entity, CameraFlyTo } from "resium";
import { Cartesian3, Color } from "cesium";
import { useBearSightings } from "./hooks/useBearSightings";
import { DataSourceCredit } from "./components/DataSourceCredit";
import './App.css'

function App() {
  // 札幌市の座標 (緯度: 43.0642°N, 経度: 141.3545°E, 高度: 10000m)
  const sapporoPosition = Cartesian3.fromDegrees(141.3545, 43.0642, 10000);

  // 実際のヒグマ出没データ（カスタムフックから読み込み）
  const { data: bearSightings, isLoading, error } = useBearSightings('/bear_sightings_2025.geojson');

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

  // エラー表示
  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>データの読み込みに失敗しました</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          zIndex: 2000,
        }}>
          <p>ヒグマ出没データを読み込み中...</p>
        </div>
      )}

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
