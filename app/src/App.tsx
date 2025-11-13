import { Viewer, Entity, CameraFlyTo } from "resium";
import { Cartesian3, Color } from "cesium";
import './App.css'

function App() {
  // 札幌市の座標 (緯度: 43.0642°N, 経度: 141.3545°E, 高度: 10000m)
  const sapporoPosition = Cartesian3.fromDegrees(141.3545, 43.0642, 10000);

  // テスト用ヒグマ目撃地点（危険度: high/medium/low）
  const bearSightings = [
    { id: 1, name: "円山公園周辺", lon: 141.329, lat: 43.0548, date: "2025-11-10", dangerLevel: "high" },
    { id: 2, name: "藻岩山麓", lon: 141.322, lat: 43.024, date: "2025-11-08", dangerLevel: "medium" },
    { id: 3, name: "南区山林地帯", lon: 141.35, lat: 42.98, date: "2025-11-05", dangerLevel: "low" },
  ];

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
    <div style={{ width: '100vw', height: '100vh' }}>
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

        {bearSightings.map((sighting) => {
          const style = getDangerStyle(sighting.dangerLevel);
          return (
            <Entity
              key={sighting.id}
              name={sighting.name}
              description={`ヒグマ目撃情報\n日時: ${sighting.date}\n場所: ${sighting.name}\n危険度: ${sighting.dangerLevel}`}
              position={Cartesian3.fromDegrees(sighting.lon, sighting.lat)}
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
    </div>
  )
}

export default App
