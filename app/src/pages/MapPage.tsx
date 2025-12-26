import type { Viewer as CesiumViewer } from 'cesium';
import {
  Cartesian3,
  Color,
  ImageryLayer,
  Ion,
  IonResource,
  OpenStreetMapImageryProvider,
  Terrain,
} from 'cesium';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CesiumComponentRef } from 'resium';
import { CameraFlyTo, Cesium3DTileset, Entity, Viewer } from 'resium';
import { DataSourceCredit } from '../components/DataSourceCredit';
import { WalkMode } from '../components/WalkMode';
import bearSightingsData from '../data/bear_sightings_2025.json';
import type { BearSighting } from '../types';

// Cesium ionのアクセストークンを設定
const cesiumToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
Ion.defaultAccessToken = cesiumToken || '';

// OpenStreetMapをベースマップとして使用（建物の写り込みを避ける）
const osmImageryProvider = new OpenStreetMapImageryProvider({
  url: 'https://tile.openstreetmap.org/',
});

// Cesium World Terrain（地形データ）を使用
// PLATEAUの建物は標高（ジオイド高）で配置されているため、
// 地形データがないと楕円体との高さの差（日本では約40m）で浮いて見える
const worldTerrain = Terrain.fromWorldTerrain();

export function MapPage() {
  // Viewerへの参照
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);

  // 札幌市中央区の座標（広域表示）
  const chuokuPosition = Cartesian3.fromDegrees(141.3, 43.0, 15000);

  // Viewerが準備できたらdepthTestAgainstTerrainを有効化
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (viewer) {
      // 地形に対する深度テストを有効化
      // 建物が地形の裏側に正しく隠れるようになる
      viewer.scene.globe.depthTestAgainstTerrain = true;
    }
  }, []);

  // 実際のヒグマ出没データ
  const bearSightings = bearSightingsData.features as BearSighting[];

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

  // モバイル判定
  const [isMobileDevice] = useState(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  });

  return (
    <div style={{ width: '100vw', height: 'calc(100vh - 56px)', position: 'relative' }}>
      <Viewer
        ref={viewerRef}
        full
        timeline={false}
        animation={false}
        homeButton={false}
        navigationHelpButton={false}
        baseLayerPicker={false}
        geocoder={false}
        sceneModePicker={false}
        baseLayer={new ImageryLayer(osmImageryProvider)}
        terrain={worldTerrain}
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
          const { date, time, ward, location, situation } = sighting.properties;

          return (
            <Entity
              key={`${date}-${time}-${ward}-${location}`}
              name={`${ward} - ${date} ${time}`}
              description={`<div style="font-size:14px;">
                <h3 style="margin:0 0 8px 0;">🐻 ヒグマ出没情報</h3>
                <p><strong>日時:</strong> ${date} ${time}</p>
                <p><strong>場所:</strong> ${location}</p>
                <p><strong>状況:</strong> ${situation}</p>
              </div>`}
              position={Cartesian3.fromDegrees(coordinates[0], coordinates[1])}
              point={{
                pixelSize: 12,
                color: Color.RED,
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

      {/* コントロールパネル */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: isMobileDevice ? '10px 12px' : '12px 16px',
          borderRadius: '8px',
          fontSize: isMobileDevice ? '12px' : '14px',
          zIndex: 1000,
          minWidth: isMobileDevice ? '160px' : '200px',
          maxWidth: isMobileDevice ? 'calc(100vw - 20px)' : 'none',
        }}
      >
        {/* ウォークモードセクション */}
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🚶 ウォークモード</div>
          <button
            type="button"
            onClick={() => setShowSightingSelector(!showSightingSelector)}
            style={{
              width: '100%',
              padding: isMobileDevice ? '12px' : '10px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: isMobileDevice ? '14px' : '13px',
              fontWeight: 'bold',
              touchAction: 'manipulation',
            }}
          >
            出没地点を歩く
          </button>

          {showSightingSelector && (
            <div
              style={{
                marginTop: '8px',
                maxHeight: isMobileDevice ? '40vh' : '200px',
                overflowY: 'auto',
              }}
            >
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
                      padding: isMobileDevice ? '10px' : '8px',
                      marginBottom: '4px',
                      backgroundColor: '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: isMobileDevice ? '12px' : '11px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      touchAction: 'manipulation',
                    }}
                  >
                    <span style={{ color: dangerColor, fontSize: isMobileDevice ? '18px' : '16px' }}>
                      ●
                    </span>
                    <span>
                      <div>
                        {ward} - {location}
                      </div>
                      <div
                        style={{
                          color: '#888',
                          fontSize: isMobileDevice ? '10px' : '10px',
                        }}
                      >
                        {date}
                      </div>
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
