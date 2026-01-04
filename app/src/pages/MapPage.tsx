import type { Viewer as CesiumViewer } from 'cesium';
import {
  BoundingSphere,
  Cartesian2,
  Cartesian3,
  Cartographic,
  Math as CesiumMath,
  Color,
  defined,
  HeadingPitchRange,
  HeightReference,
  ImageryLayer,
  Ion,
  JulianDate,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  sampleTerrainMostDetailed,
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
import bearSightingsData from '../data/bear_sightings.json';
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

// 3Dモデル設定
// GLBモデルの元サイズは不明なため、経験的に求めた係数を使用
// 目標: ヒグマは体長約2m、足跡は約30cm程度のサイズで表示
const MODEL_CONFIG: Record<
  string,
  { uri: string; targetHeightMeters: number; baseScaleFactor: number; heightOffset: number }
> = {
  ヒグマ確認: {
    uri: '/models/bear.glb',
    targetHeightMeters: 2, // 実際のヒグマの体長（約2m）
    baseScaleFactor: 0.01, // GLBモデル→1mに変換する経験的係数
    heightOffset: 1, // 地面から浮かせる高さ(m)
  },
  痕跡: {
    uri: '/models/paw.glb',
    targetHeightMeters: 0.5, // 足跡サイズ（視認性のため少し大きめ）
    baseScaleFactor: 0.01,
    heightOffset: 0.3,
  },
};

// スケール計算: 目標サイズ × 基本係数
const getModelScale = (category: string, isSelected: boolean): number => {
  const config = MODEL_CONFIG[category];
  if (!config) return 1;
  const baseScale = config.targetHeightMeters * config.baseScaleFactor;
  return isSelected ? baseScale * 1.5 : baseScale;
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

// PLATEAU配信サービス 札幌市全10区の3D Tiles URL
// https://github.com/Project-PLATEAU/plateau-streaming-tutorial
const PLATEAU_SAPPORO_TILES = {
  chuo: 'https://assets.cms.plateau.reearth.io/assets/a6/031403-b4dc-4d5d-8c2f-50361fedc764/01100_sapporo-shi_city_2020_citygml_7_op_bldg_3dtiles_01101_chuo-ku_lod1/tileset.json',
  kita: 'https://assets.cms.plateau.reearth.io/assets/b6/2fe16c-44c8-4a42-8138-82c971cd0e2c/01100_sapporo-shi_city_2020_citygml_7_op_bldg_3dtiles_01102_kita-ku_lod1/tileset.json',
  higashi:
    'https://assets.cms.plateau.reearth.io/assets/98/2f5131-ad3c-4551-943a-3607ed6afa3c/01100_sapporo-shi_city_2020_citygml_7_op_bldg_3dtiles_01103_higashi-ku_lod1/tileset.json',
  shiroishi:
    'https://assets.cms.plateau.reearth.io/assets/a2/2d4d91-f50a-4fd8-a055-771bf1495095/01100_sapporo-shi_city_2020_citygml_7_op_bldg_3dtiles_01104_shiroishi-ku_lod1/tileset.json',
  toyohira:
    'https://assets.cms.plateau.reearth.io/assets/02/d7a24f-76db-4295-844e-c667831fea43/01100_sapporo-shi_city_2020_citygml_7_op_bldg_3dtiles_01105_toyohira-ku_lod1/tileset.json',
  minami:
    'https://assets.cms.plateau.reearth.io/assets/aa/5f71a5-4442-4dcb-80bb-a022adbe409c/01100_sapporo-shi_city_2020_citygml_7_op_bldg_3dtiles_01106_minami-ku_lod1/tileset.json',
  nishi:
    'https://assets.cms.plateau.reearth.io/assets/e1/e6b234-82bd-4311-b72b-5920b6dfc569/01100_sapporo-shi_city_2020_citygml_7_op_bldg_3dtiles_01107_nishi-ku_lod1/tileset.json',
  atsubetsu:
    'https://assets.cms.plateau.reearth.io/assets/26/96d6b5-1c35-40e3-bb79-c5b53f15405a/01100_sapporo-shi_city_2020_citygml_7_op_bldg_3dtiles_01108_atsubetsu-ku_lod1/tileset.json',
  teine:
    'https://assets.cms.plateau.reearth.io/assets/70/811042-e748-47a7-9f3e-420003f445b9/01100_sapporo-shi_city_2020_citygml_7_op_bldg_3dtiles_01109_teine-ku_lod1/tileset.json',
  kiyota:
    'https://assets.cms.plateau.reearth.io/assets/1d/c2a380-16cd-4a40-b860-0889727d752c/01100_sapporo-shi_city_2020_citygml_7_op_bldg_3dtiles_01110_kiyota-ku_lod1/tileset.json',
};

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
              // マーカーにカメラをフォーカス（地形高さを考慮）
              const [lng, lat] = sighting.geometry.coordinates;
              const distance = 400; // マーカーからの距離(m)
              const pitchDegrees = -25; // カメラ角度(度)
              const heightAboveTerrain = 30; // 地形からの高さ(m)

              // 地形の高さを取得してカメラ位置を設定
              const terrainProvider = cesiumViewer.terrainProvider;
              const position = Cartographic.fromDegrees(lng, lat);
              sampleTerrainMostDetailed(terrainProvider, [position]).then((updatedPositions) => {
                const terrainHeight = updatedPositions[0].height || 0;
                const targetHeight = terrainHeight + heightAboveTerrain;
                const targetPosition = Cartesian3.fromDegrees(lng, lat, targetHeight);
                cesiumViewer.camera.flyToBoundingSphere(new BoundingSphere(targetPosition, 0), {
                  offset: new HeadingPitchRange(
                    0, // heading: 北向き
                    CesiumMath.toRadians(pitchDegrees),
                    distance,
                  ),
                  duration: 1.0,
                });
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

        {/* PLATEAU 3D都市モデル（札幌市全10区） */}
        {Object.entries(PLATEAU_SAPPORO_TILES).map(([ward, url]) => (
          <Cesium3DTileset key={ward} url={url} />
        ))}

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

          // 選択時のみ3Dモデル表示、それ以外はポイントマーカー（引きで見やすくするため）
          const modelConfig = MODEL_CONFIG[category];
          const show3DModel = isSelected && !!modelConfig;

          // 3Dモデル表示時は高さオフセットを適用
          const heightOffset = show3DModel && modelConfig ? modelConfig.heightOffset : 0;

          return (
            <Entity
              key={`bear-${date}-${time}-${ward}-${location}`}
              name={`bear:${originalIndex}`}
              position={Cartesian3.fromDegrees(coordinates[0], coordinates[1], heightOffset)}
              point={
                show3DModel
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
                show3DModel && modelConfig
                  ? {
                      uri: modelConfig.uri,
                      scale: getModelScale(category, true),
                      minimumPixelSize: 24,
                      maximumScale: getModelScale(category, true) * 50,
                      heightReference: HeightReference.RELATIVE_TO_GROUND,
                      silhouetteColor: Color.WHITE,
                      silhouetteSize: 2,
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
