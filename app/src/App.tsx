import { Cartesian3, Color, Ion, IonResource, Terrain } from 'cesium';
import { useEffect, useState } from 'react';
import { CameraFlyTo, Cesium3DTileset, Entity, Viewer } from 'resium';
import { DataSourceCredit } from './components/DataSourceCredit';
import bearSightingsData from './data/bear_sightings_2025.json';
import './App.css';

// Cesium ionのアクセストークンを設定
const cesiumToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
console.log('Cesium Token exists:', !!cesiumToken);
Ion.defaultAccessToken = cesiumToken || '';

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
  console.log('App component rendering');

  // 札幌市中央区の座標（3D建物が見やすい位置）
  // 経度: 141.35°E, 緯度: 43.06°N, 高度: 5000m（俯瞰視点）
  const chuokuPosition = Cartesian3.fromDegrees(141.35, 43.06, 5000);

  // 実際のヒグマ出没データ（静的インポート）
  const bearSightings = bearSightingsData.features as BearSighting[];

  // 地形データを非同期で読み込む
  const [terrain, setTerrain] = useState<Terrain | undefined>(undefined);

  useEffect(() => {
    console.log('App mounted, setting terrain...');
    try {
      const terrainData = Terrain.fromWorldTerrain();
      console.log('Terrain initialized');
      setTerrain(terrainData);
    } catch (err) {
      console.error('Failed to initialize terrain:', err);
    }
  }, []);

  // 危険度に応じた色とサイズを返す関数
  const getDangerStyle = (level: string) => {
    switch (level) {
      case 'high':
        return { color: Color.RED, size: 20 };
      case 'medium':
        return { color: Color.YELLOW, size: 16 };
      case 'low':
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
        terrain={terrain}
      >
        <CameraFlyTo destination={chuokuPosition} duration={0} />

        {/* PLATEAU 3D都市モデル（札幌市中央区） */}
        {import.meta.env.VITE_CESIUM_ASSET_ID_CHUO && (
          <Cesium3DTileset
            url={IonResource.fromAssetId(Number(import.meta.env.VITE_CESIUM_ASSET_ID_CHUO))}
          />
        )}

        {/* PLATEAU 3D都市モデル（札幌市南区） */}
        {import.meta.env.VITE_CESIUM_ASSET_ID_MINAMI && (
          <Cesium3DTileset
            url={IonResource.fromAssetId(Number(import.meta.env.VITE_CESIUM_ASSET_ID_MINAMI))}
          />
        )}

        {/* PLATEAU 3D都市モデル（札幌市西区） */}
        {import.meta.env.VITE_CESIUM_ASSET_ID_NISHI && (
          <Cesium3DTileset
            url={IonResource.fromAssetId(Number(import.meta.env.VITE_CESIUM_ASSET_ID_NISHI))}
          />
        )}

        {/* ヒグマ出没マーカー */}
        {bearSightings.map((sighting) => {
          const { coordinates } = sighting.geometry;
          const { date, time, ward, location, situation, dangerLevel } = sighting.properties;
          const style = getDangerStyle(dangerLevel);

          return (
            <Entity
              key={`${date}-${time}-${ward}-${location}`}
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
  );
}

export default App;
