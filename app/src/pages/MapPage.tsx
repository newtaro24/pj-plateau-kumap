import type { Viewer as CesiumViewer } from 'cesium';
import {
  Cartesian2,
  Cartesian3,
  Math as CesiumMath,
  Color,
  defined,
  HeightReference,
  ImageryLayer,
  Ion,
  IonResource,
  JulianDate,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Terrain,
  UrlTemplateImageryProvider,
} from 'cesium';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { CesiumComponentRef } from 'resium';
import { CameraFlyTo, Cesium3DTileset, EllipseGraphics, Entity, Viewer } from 'resium';
import { DataSourceCredit } from '../components/DataSourceCredit';
import { MapControls } from '../components/MapControls';
import { SightingInfoPanel } from '../components/SightingInfoPanel';
import bearSightingsData from '../data/bear_sightings_2025.json';
import { useBearFilter } from '../hooks/useBearFilter';
import { useIsMobile } from '../hooks/useIsMobile';
import type { BearSighting } from '../types';
import { categorizeSituation, SITUATION_CATEGORIES } from '../utils/statsCalculator';

// 状況タイプ別の配色（茶色ベース、ダーク背景に映える）
const SITUATION_COLORS: Record<string, string> = {
  ヒグマ確認: '#a1785b', // 茶色（メインテーマ）
  痕跡: '#7c9473', // 緑系（自然の痕跡）
  その他: '#8b7da8', // 紫グレー
};

// 3Dモデルのパス（カテゴリ別）
const MODEL_URIS: Record<string, string> = {
  ヒグマ確認: '/models/bear.glb',
  痕跡: '/models/paw.glb',
};

// Cesium ionのアクセストークンを設定
const cesiumToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
Ion.defaultAccessToken = cesiumToken || '';

// PLATEAU VIEW 白地図タイル（シンプルで見やすい）
const lightMapProvider = new UrlTemplateImageryProvider({
  url: 'https://api.plateauview.mlit.go.jp/tiles/light-map/{z}/{x}/{y}.png',
  maximumLevel: 18,
});
const lightMapLayer = new ImageryLayer(lightMapProvider);

// 白地図スタイルの背景色（タイルが読み込まれていない領域用）
const LIGHT_BASE_COLOR = Color.fromCssColorString('#f5f5f5');

// Cesium World Terrain（地形データ）を使用
const worldTerrain = Terrain.fromWorldTerrain();

// ヒグマ出没データ（コンポーネント外で定義）
const bearSightings = bearSightingsData.features as BearSighting[];

// 札幌市の初期視点（札幌駅付近を中心に俯瞰）
// pitch -45度で札幌市中心部が画面中央に来るよう南にオフセット
const INITIAL_POSITION = Cartesian3.fromDegrees(141.35, 42.65, 50000);
const INITIAL_ORIENTATION = {
  heading: 0,
  pitch: CesiumMath.toRadians(-45), // 斜めから見下ろす
  roll: 0,
};

export function MapPage() {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [searchParams] = useSearchParams();
  const [selectedSighting, setSelectedSighting] = useState<BearSighting | null>(null);
  const [lightingEnabled, setLightingEnabled] = useState(true);
  const showHeatmap = false; // ヒートマップは現在無効化
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  const initialFlyDone = useRef(false);
  const isMobile = useIsMobile();

  // フィルター機能
  const { filters, filtered, toggleSituation, clearFilters, hasActiveFilters } =
    useBearFilter(bearSightings);

  // URLパラメータから座標を取得
  const targetCoords = useMemo(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      return { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) };
    }
    return null;
  }, [searchParams]);

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

      // 白地図スタイル：地球の基本色と背景色を明るく設定
      cesiumViewer.scene.globe.baseColor = LIGHT_BASE_COLOR;
      cesiumViewer.scene.backgroundColor = LIGHT_BASE_COLOR;

      // URLパラメータの座標にflyTo
      if (targetCoords && !initialFlyDone.current) {
        initialFlyDone.current = true;
        // カメラ高度と角度から、マーカーが画面中央に来るようオフセット計算
        // pitch -30度でカメラを南にオフセット
        const cameraHeight = 800; // カメラ高度
        const latOffset = 0.012; // オフセット（緯度方向）
        cesiumViewer.camera.flyTo({
          destination: Cartesian3.fromDegrees(
            targetCoords.lng,
            targetCoords.lat - latOffset,
            cameraHeight,
          ),
          orientation: {
            heading: 0,
            pitch: CesiumMath.toRadians(-30),
            roll: 0,
          },
          duration: 1.5,
        });

        // 該当するsightingを選択状態にする
        const matchingSighting = bearSightings.find((s) => {
          const [sLng, sLat] = s.geometry.coordinates;
          return (
            Math.abs(sLat - targetCoords.lat) < 0.0001 && Math.abs(sLng - targetCoords.lng) < 0.0001
          );
        });
        if (matchingSighting) {
          setSelectedSighting(matchingSighting);
        }
      }

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
              // マーカーにカメラをフォーカス
              const [lng, lat] = sighting.geometry.coordinates;
              const cameraHeight = 800;
              const latOffset = 0.012;
              cesiumViewer.camera.flyTo({
                destination: Cartesian3.fromDegrees(lng, lat - latOffset, cameraHeight),
                orientation: {
                  heading: 0,
                  pitch: CesiumMath.toRadians(-30),
                  roll: 0,
                },
                duration: 1.0,
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
  }, [targetCoords]);

  // 日照シミュレーション制御
  useEffect(() => {
    const cesiumViewer = viewerRef.current?.cesiumElement;
    if (!cesiumViewer || !cesiumViewer.scene || !cesiumViewer.scene.globe) {
      return;
    }

    // 照明と影のオン/オフ
    cesiumViewer.scene.globe.enableLighting = lightingEnabled;
    cesiumViewer.shadows = lightingEnabled;

    // 選択中のマーカーがあれば、その日時を設定
    if (lightingEnabled && selectedSighting) {
      try {
        const { date, time } = selectedSighting.properties;
        // time: "9:30" → "09:30" に正規化
        const normalizedTime = time
          ? time.replace(/^(\d):/, '0$1:').replace(/:(\d)$/, ':0$1')
          : '12:00';
        const isoString = `${date}T${normalizedTime}:00+09:00`;
        cesiumViewer.clock.currentTime = JulianDate.fromIso8601(isoString);
        cesiumViewer.clock.shouldAnimate = false;
      } catch (e) {
        console.error('Failed to set clock time:', e);
      }
    }
  }, [lightingEnabled, selectedSighting]);

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
        baseLayer={lightMapLayer}
        terrain={worldTerrain}
        shadows={lightingEnabled}
      >
        {/* 初期カメラ位置を設定（一度だけ実行） */}
        <CameraFlyTo
          destination={INITIAL_POSITION}
          orientation={INITIAL_ORIENTATION}
          duration={0}
          once={true}
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

        {/* ヒグマ出没マーカー（フィルター適用済み） */}
        {filtered.map((sighting) => {
          const { coordinates } = sighting.geometry;
          const { date, time, ward, location, situation } = sighting.properties;
          // 元のbearSightingsでのインデックスを取得（クリックイベント用）
          const originalIndex = bearSightings.findIndex(
            (s) => s.properties.date === date && s.properties.location === location,
          );
          const isSelected =
            selectedSighting &&
            selectedSighting.properties.date === date &&
            selectedSighting.properties.location === location;

          // 種別に応じた色を取得
          const category = categorizeSituation(situation);
          const markerColor = SITUATION_COLORS[category] || '#a1785b';

          // モデルがあるカテゴリは3Dモデル、それ以外はポイントマーカー
          const modelUri = MODEL_URIS[category];
          const use3DModel = !!modelUri;

          return (
            <Entity
              key={`bear-${date}-${time}-${ward}-${location}`}
              name={`bear:${originalIndex}`}
              position={Cartesian3.fromDegrees(coordinates[0], coordinates[1])}
              point={
                use3DModel
                  ? undefined
                  : {
                      pixelSize: isSelected ? 16 : 10,
                      color: Color.fromCssColorString(markerColor),
                      outlineColor: Color.WHITE,
                      outlineWidth: isSelected ? 3 : 2,
                      heightReference: HeightReference.CLAMP_TO_GROUND,
                      disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    }
              }
              model={
                use3DModel && modelUri
                  ? {
                      uri: modelUri,
                      scale: isSelected ? 3 : 2,
                      minimumPixelSize: isSelected ? 24 : 16,
                      maximumScale: 15,
                      heightReference: HeightReference.CLAMP_TO_GROUND,
                      silhouetteColor: isSelected ? Color.WHITE : undefined,
                      silhouetteSize: isSelected ? 2 : 0,
                      color: Color.fromCssColorString(markerColor),
                      colorBlendMode: 2, // ColorBlendMode.MIX
                      colorBlendAmount: 0.3,
                    }
                  : undefined
              }
            />
          );
        })}

        {/* ヒートマップ */}
        {showHeatmap &&
          bearSightings.map((sighting) => {
            const { coordinates } = sighting.geometry;
            const { date, time, location } = sighting.properties;

            return (
              <Entity
                key={`heat-${date}-${time}-${location}`}
                position={Cartesian3.fromDegrees(coordinates[0], coordinates[1])}
              >
                <EllipseGraphics
                  semiMajorAxis={500}
                  semiMinorAxis={500}
                  material={Color.fromCssColorString('#ef4444').withAlpha(0.15)}
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
        lightingEnabled={lightingEnabled}
        onToggleLighting={() => setLightingEnabled(!lightingEnabled)}
        currentDateTime={
          selectedSighting
            ? { date: selectedSighting.properties.date, time: selectedSighting.properties.time }
            : null
        }
      />

      {/* 種別フィルター */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: isMobile ? '8px' : '50%',
          right: isMobile ? '8px' : 'auto',
          transform: isMobile ? 'none' : 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '6px',
            backgroundColor: 'rgba(48, 48, 48, 0.9)',
            padding: '8px 12px',
            borderRadius: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {SITUATION_CATEGORIES.map((category) => {
            const isActive = filters.situations.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleSituation(category)}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#a1785b' : 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  transition: 'background-color 0.15s',
                }}
              >
                {category}
              </button>
            );
          })}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                color: '#fff',
                transition: 'background-color 0.15s',
              }}
            >
              クリア
            </button>
          )}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.8)',
            backgroundColor: 'rgba(48, 48, 48, 0.8)',
            padding: '4px 10px',
            borderRadius: '4px',
          }}
        >
          {filtered.length} / {bearSightings.length} 件表示
        </div>
      </div>

      {/* データソースクレジット */}
      <DataSourceCredit
        dataSourceName="札幌市オープンデータ"
        dataSourceUrl="https://ckan.pf-sapporo.jp/dataset/sapporo_bear_appearance"
        license="CC BY 4.0"
      />
    </div>
  );
}
