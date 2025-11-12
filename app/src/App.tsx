import { Viewer } from "resium";
import { Cartesian3 } from "cesium";
import './App.css'

function App() {
  // 札幌市の座標 (緯度: 43.0642°N, 経度: 141.3545°E)
  const sapporoPosition = Cartesian3.fromDegrees(141.3545, 43.0642, 100000);

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
        camera={{ position: sapporoPosition }}
      />
    </div>
  )
}

export default App
