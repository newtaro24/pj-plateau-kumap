import { Cartesian3, Color, Ion, IonResource, Rectangle } from 'cesium';
import { useCallback, useState } from 'react';
import { CameraFlyTo, Cesium3DTileset, Entity, RectangleGraphics, Viewer } from 'resium';
import { DataSourceCredit } from './components/DataSourceCredit';
import { WalkMode } from './components/WalkMode';
import bearSightingsData from './data/bear_sightings_2025.json';
import safetyGridData from './data/safety-grid.json';
import './App.css';

// Cesium ionのアクセストークンを設定
const cesiumToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
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

// 安全度に応じた色を返す関数（緑=安全、赤=危険）
function getSafetyColor(safety: number): Color {
  // 安全度0-1を、赤(危険)→黄→緑(安全)のグラデーションに変換
  if (safety >= 0.7) {
    // 緑〜黄緑（安全）
    const t = (safety - 0.7) / 0.3;
    return Color.fromCssColorString(`rgba(${Math.round(100 - t * 100)}, 180, 80, 0.4)`);
  } else if (safety >= 0.4) {
    // 黄〜オレンジ（注意）
    const t = (safety - 0.4) / 0.3;
    return Color.fromCssColorString(`rgba(255, ${Math.round(180 - (1 - t) * 80)}, 50, 0.45)`);
  } else {
    // 赤〜濃い赤（危険）
    const t = safety / 0.4;
    return Color.fromCssColorString(`rgba(200, ${Math.round(50 * t)}, 50, 0.5)`);
  }
}

interface SafetyCell {
  lon: number;
  lat: number;
  safety: number;
}

function App() {
  // 札幌市中央区の座標（広域表示）
  const chuokuPosition = Cartesian3.fromDegrees(141.3, 43.0, 15000);

  // 実際のヒグマ出没データ
  const bearSightings = bearSightingsData.features as BearSighting[];

  // 安全度グリッドデータ
  const safetyGrid = safetyGridData.cells as SafetyCell[];
  const gridSize = safetyGridData.gridSize;

  // ヒートマップ表示切り替え
  const [showHeatmap, setShowHeatmap] = useState(true);

  // ウォークモード
  const [walkModeEnabled, setWalkModeEnabled] = useState(false);
  const [walkStartPosition, setWalkStartPosition] = useState<{ lon: number; lat: number } | null>(
    null,
  );

  const handleExitWalkMode = useCallback(() => {
    setWalkModeEnabled(false);
    setWalkStartPosition(null);
  }, []);

  const handleStartWalkMode = useCallback((lon: number, lat: number) => {
    setWalkStartPosition({ lon, lat });
    setWalkModeEnabled(true);
    setShowSightingSelector(false);
  }, []);

  // 出没地点選択パネル
  const [showSightingSelector, setShowSightingSelector] = useState(false);

  // 直近の出没データ（上位10件）
  const recentSightings = bearSightings.slice(0, 10);

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

        {/* 安全度ヒートマップ */}
        {showHeatmap &&
          safetyGrid.map((cell) => (
            <Entity key={`grid-${cell.lon}-${cell.lat}`}>
              <RectangleGraphics
                coordinates={Rectangle.fromDegrees(
                  cell.lon,
                  cell.lat,
                  cell.lon + gridSize,
                  cell.lat + gridSize,
                )}
                material={getSafetyColor(cell.safety)}
                outline={false}
                height={0}
                extrudedHeight={1}
              />
            </Entity>
          ))}

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

        {/* ウォークモード */}
        <WalkMode
          enabled={walkModeEnabled}
          onExit={handleExitWalkMode}
          startPosition={walkStartPosition}
        />
      </Viewer>

      <DataSourceCredit
        dataSourceName="札幌市オープンデータ"
        dataSourceUrl="https://ckan.pf-sapporo.jp/dataset/sapporo_bear_appearance"
        license="CC BY 4.0"
      />

      {/* ヒートマップ凡例・コントロール */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          zIndex: 1000,
          minWidth: '200px',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>🗺️ 逃げやすさマップ</div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div
              style={{
                width: '20px',
                height: '12px',
                backgroundColor: 'rgba(0, 180, 80, 0.7)',
                borderRadius: '2px',
              }}
            />
            <span style={{ fontSize: '12px' }}>建物多い（逃げやすい）</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div
              style={{
                width: '20px',
                height: '12px',
                backgroundColor: 'rgba(255, 180, 50, 0.7)',
                borderRadius: '2px',
              }}
            />
            <span style={{ fontSize: '12px' }}>やや少ない（注意）</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '20px',
                height: '12px',
                backgroundColor: 'rgba(200, 50, 50, 0.7)',
                borderRadius: '2px',
              }}
            />
            <span style={{ fontSize: '12px' }}>建物少ない（危険）</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHeatmap(!showHeatmap)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: showHeatmap ? '#4CAF50' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          {showHeatmap ? '✓ ヒートマップ表示中' : 'ヒートマップを表示'}
        </button>

        <div style={{ marginTop: '12px', fontSize: '11px', color: '#aaa' }}>
          ※ 建物密度に基づく概算値
        </div>

        {/* ウォークモードセクション */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #444' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🚶 ウォークモード</div>
          <button
            type="button"
            onClick={() => setShowSightingSelector(!showSightingSelector)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            出没地点を歩く
          </button>

          {showSightingSelector && (
            <div style={{ marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {recentSightings.map((sighting) => {
                const { coordinates } = sighting.geometry;
                const { date, ward, location, dangerLevel } = sighting.properties;
                const dangerColor =
                  dangerLevel === 'high'
                    ? '#ff4444'
                    : dangerLevel === 'medium'
                      ? '#ffaa00'
                      : '#44ff44';
                return (
                  <button
                    key={`walk-${date}-${ward}-${location}`}
                    type="button"
                    onClick={() => handleStartWalkMode(coordinates[0], coordinates[1])}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginBottom: '4px',
                      backgroundColor: '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ color: dangerColor, fontSize: '16px' }}>●</span>
                    <span>
                      <div>
                        {ward} - {location}
                      </div>
                      <div style={{ color: '#888', fontSize: '10px' }}>{date}</div>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
