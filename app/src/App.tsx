import { Viewer, Entity, CameraFlyTo } from "resium";
import { Cartesian3, Color } from "cesium";
import './App.css'

function App() {
  // 札幌市の座標 (緯度: 43.0642°N, 経度: 141.3545°E)
  const sapporoPosition = Cartesian3.fromDegrees(141.3545, 43.0642, 50000);

  // テスト用ヒグマ目撃地点
  const bearSightings = [
    { id: 1, name: "円山公園周辺", lon: 141.329, lat: 43.0548, date: "2025-11-10" },
    { id: 2, name: "藻岩山麓", lon: 141.322, lat: 43.024, date: "2025-11-08" },
    { id: 3, name: "南区山林地帯", lon: 141.35, lat: 42.98, date: "2025-11-05" },
  ];

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

        {bearSightings.map((sighting) => (
          <Entity
            key={sighting.id}
            name={sighting.name}
            description={`ヒグマ目撃情報\n日時: ${sighting.date}\n場所: ${sighting.name}`}
            position={Cartesian3.fromDegrees(sighting.lon, sighting.lat)}
            point={{
              pixelSize: 15,
              color: Color.RED,
              outlineColor: Color.WHITE,
              outlineWidth: 2,
            }}
          />
        ))}
      </Viewer>
    </div>
  )
}

export default App
