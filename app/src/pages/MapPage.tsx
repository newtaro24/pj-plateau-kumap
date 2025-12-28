import type { Viewer as CesiumViewer } from 'cesium';
import {
  Cartesian2,
  Cartesian3,
  Math as CesiumMath,
  Color,
  defined,
  ImageryLayer,
  Ion,
  IonResource,
  OpenStreetMapImageryProvider,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Terrain,
} from 'cesium';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CesiumComponentRef } from 'resium';
import { CameraFlyTo, Cesium3DTileset, EllipseGraphics, Entity, Viewer } from 'resium';
import { DataSourceCredit } from '../components/DataSourceCredit';
import { MapControls } from '../components/MapControls';
import { SightingInfoPanel } from '../components/SightingInfoPanel';
import bearSightingsData from '../data/bear_sightings_2025.json';
import type { BearSighting } from '../types';

// Cesium ionのアクセストークンを設定
const cesiumToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
Ion.defaultAccessToken = cesiumToken || '';

// OpenStreetMapをベースマップとして使用（建物の写り込みを避ける）
const osmImageryProvider = new OpenStreetMapImageryProvider({
  url: 'https://tile.openstreetmap.org/',
});
const baseLayer = new ImageryLayer(osmImageryProvider);

// Cesium World Terrain（地形データ）を使用
const worldTerrain = Terrain.fromWorldTerrain();

// ヒグマ出没データ（コンポーネント外で定義）
const bearSightings = bearSightingsData.features as BearSighting[];

// 札幌市の初期視点（俯瞰）- コンポーネント外で定義
const INITIAL_POSITION = Cartesian3.fromDegrees(141.35, 43.05, 80000);
const INITIAL_ORIENTATION = {
  heading: 0,
  pitch: CesiumMath.toRadians(-70), // より真上からの視点
  roll: 0,
};

export function MapPage() {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [selectedSighting, setSelectedSighting] = useState<BearSighting | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);

  // 区ごとの出没件数を計算
  const wardCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of bearSightings) {
      const ward = s.properties.ward;
      counts.set(ward, (counts.get(ward) || 0) + 1);
    }
    return counts;
  }, []);

  // Viewerが準備できたら設定
  useEffect(() => {
    let handler: ScreenSpaceEventHandler | null = null;
    let timeoutId: number | null = null;

    const setupViewer = () => {
      const cesiumViewer = viewerRef.current?.cesiumElement;
      if (!cesiumViewer || !cesiumViewer.scene || !cesiumViewer.scene.globe) {
        // Viewerがまだ準備できていない場合は再試行
        timeoutId = window.setTimeout(setupViewer, 100);
        return;
      }

      // 地形に対する深度テストを有効化
      cesiumViewer.scene.globe.depthTestAgainstTerrain = true;

      // クリックイベントハンドラーを設定
      handler = new ScreenSpaceEventHandler(cesiumViewer.scene.canvas);
      handlerRef.current = handler;

      handler.setInputAction((movement: { position: { x: number; y: number } }) => {
        const position = new Cartesian2(movement.position.x, movement.position.y);
        const pickedObject = cesiumViewer.scene.pick(position);

        if (defined(pickedObject) && pickedObject.id && pickedObject.id.name) {
          const name = pickedObject.id.name as string;
          if (name.startsWith('bear:')) {
            const index = Number.parseInt(name.replace('bear:', ''), 10);
            const sighting = bearSightings[index];
            if (sighting) {
              setSelectedSighting(sighting);
              // マーカーの位置にズーム（現在のカメラ高度を維持）
              const currentHeight = cesiumViewer.camera.positionCartographic.height;
              const targetHeight = Math.min(currentHeight, 5000); // 最大5kmまでズーム
              cesiumViewer.camera.flyTo({
                destination: Cartesian3.fromDegrees(
                  sighting.geometry.coordinates[0],
                  sighting.geometry.coordinates[1],
                  targetHeight,
                ),
                orientation: {
                  heading: cesiumViewer.camera.heading,
                  pitch: cesiumViewer.camera.pitch,
                  roll: 0,
                },
                duration: 0.5,
              });
              return;
            }
          }
        }
        // マーカー以外をクリックした場合は選択解除
        setSelectedSighting(null);
      }, ScreenSpaceEventType.LEFT_CLICK);
    };

    setupViewer();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      if (handler) {
        handler.destroy();
      }
      handlerRef.current = null;
    };
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedSighting(null);
  }, []);

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
        infoBox={false}
        selectionIndicator={false}
        baseLayer={baseLayer}
        terrain={worldTerrain}
      >
        {/* 初期カメラ位置を設定 */}
        <CameraFlyTo
          destination={INITIAL_POSITION}
          orientation={INITIAL_ORIENTATION}
          duration={0}
        />

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
        {bearSightings.map((sighting, index) => {
          const { coordinates } = sighting.geometry;
          const { date, time, ward, location, dangerLevel } = sighting.properties;
          const isSelected =
            selectedSighting &&
            selectedSighting.properties.date === date &&
            selectedSighting.properties.location === location;

          // 危険度に応じた色
          const markerColor =
            dangerLevel === 'high'
              ? Color.fromCssColorString('#ef4444')
              : dangerLevel === 'medium'
                ? Color.fromCssColorString('#f59e0b')
                : Color.fromCssColorString('#22c55e');

          return (
            <Entity
              key={`bear-${date}-${time}-${ward}-${location}`}
              name={`bear:${index}`}
              position={Cartesian3.fromDegrees(coordinates[0], coordinates[1])}
              point={{
                pixelSize: isSelected ? 16 : 10,
                color: markerColor,
                outlineColor: Color.WHITE,
                outlineWidth: isSelected ? 3 : 2,
              }}
            />
          );
        })}

        {/* ヒートマップ */}
        {showHeatmap &&
          bearSightings.map((sighting) => {
            const { coordinates } = sighting.geometry;
            const { date, time, location } = sighting.properties;
            const dangerLevel = sighting.properties.dangerLevel;
            const heatColor =
              dangerLevel === 'high'
                ? Color.fromCssColorString('#ef4444').withAlpha(0.15)
                : dangerLevel === 'medium'
                  ? Color.fromCssColorString('#f59e0b').withAlpha(0.12)
                  : Color.fromCssColorString('#22c55e').withAlpha(0.1);

            return (
              <Entity
                key={`heat-${date}-${time}-${location}`}
                position={Cartesian3.fromDegrees(coordinates[0], coordinates[1])}
              >
                <EllipseGraphics
                  semiMajorAxis={500}
                  semiMinorAxis={500}
                  material={heatColor}
                  outline={false}
                  height={0}
                />
              </Entity>
            );
          })}
      </Viewer>

      {/* カスタム情報パネル */}
      <SightingInfoPanel
        sighting={selectedSighting}
        onClose={handleClosePanel}
        totalInWard={
          selectedSighting ? wardCounts.get(selectedSighting.properties.ward) : undefined
        }
      />

      {/* マップコントロール */}
      <MapControls
        viewerRef={viewerRef}
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap((prev) => !prev)}
      />

      {/* データソースクレジット */}
      <DataSourceCredit
        dataSourceName="札幌市オープンデータ"
        dataSourceUrl="https://ckan.pf-sapporo.jp/dataset/sapporo_bear_appearance"
        license="CC BY 4.0"
      />
    </div>
  );
}
