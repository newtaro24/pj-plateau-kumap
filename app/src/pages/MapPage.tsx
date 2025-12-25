import { Cartesian3, Color, Ion, IonResource, Rectangle } from 'cesium';
import { useCallback, useMemo, useState } from 'react';
import { CameraFlyTo, Cesium3DTileset, Entity, RectangleGraphics, Viewer } from 'resium';
import { DataSourceCredit } from '../components/DataSourceCredit';
import { WalkMode } from '../components/WalkMode';
import bearSightingsData from '../data/bear_sightings_2025.json';
import safetyGridData from '../data/safety-grid.json';
import type { BearSighting, SafetyCell } from '../types';
import {
  findNearestBuildingDistance,
  formatDistance,
  getEvacuationLevel,
} from '../utils/evacuationScore';

// Cesium ionのアクセストークンを設定
const cesiumToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
Ion.defaultAccessToken = cesiumToken || '';

// 安全度に応じた色を返す関数（緑=安全、赤=危険）
function getSafetyColor(safety: number): Color {
  if (safety >= 0.7) {
    const t = (safety - 0.7) / 0.3;
    return Color.fromCssColorString(`rgba(${Math.round(100 - t * 100)}, 180, 80, 0.4)`);
  } else if (safety >= 0.4) {
    const t = (safety - 0.4) / 0.3;
    return Color.fromCssColorString(`rgba(255, ${Math.round(180 - (1 - t) * 80)}, 50, 0.45)`);
  } else {
    const t = safety / 0.4;
    return Color.fromCssColorString(`rgba(200, ${Math.round(50 * t)}, 50, 0.5)`);
  }
}

export function MapPage() {
  // 札幌市中央区の座標（広域表示）
  const chuokuPosition = Cartesian3.fromDegrees(141.3, 43.0, 15000);

  // 実際のヒグマ出没データ
  const bearSightings = bearSightingsData.features as BearSighting[];

  // 安全度グリッドデータ
  const safetyGrid = safetyGridData.cells as SafetyCell[];
  const gridSize = safetyGridData.gridSize;

  // 各出没地点の最寄り建物距離を計算（メモ化）
  const sightingsWithDistance = useMemo(() => {
    return bearSightings.map((sighting) => {
      const [lon, lat] = sighting.geometry.coordinates;
      const distance = findNearestBuildingDistance(lon, lat);
      const level = getEvacuationLevel(distance);
      return { ...sighting, distance, level };
    });
  }, [bearSightings]);

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

  // 避難レベルに応じた色とサイズを返す関数
  const getEvacuationStyle = (level: 'safe' | 'caution' | 'danger') => {
    switch (level) {
      case 'safe':
        return { color: Color.LIME, size: 14 };
      case 'caution':
        return { color: Color.YELLOW, size: 16 };
      case 'danger':
        return { color: Color.RED, size: 20 };
      default:
        return { color: Color.WHITE, size: 12 };
    }
  };

  return (
    <div style={{ width: '100vw', height: 'calc(100vh - 56px)', position: 'relative' }}>
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

        {/* ヒグマ出没マーカー（避難場所スコア付き） */}
        {sightingsWithDistance.map((sighting) => {
          const { coordinates } = sighting.geometry;
          const { date, time, ward, location, situation } = sighting.properties;
          const style = getEvacuationStyle(sighting.level);
          const distanceText = formatDistance(sighting.distance);
          const levelText =
            sighting.level === 'safe'
              ? '🟢 逃げやすい'
              : sighting.level === 'caution'
                ? '🟡 やや遠い'
                : '🔴 逃げ場が遠い';

          return (
            <Entity
              key={`${date}-${time}-${ward}-${location}`}
              name={`${ward} - ${date} ${time}`}
              description={`<div style="font-size:14px;">
                <h3 style="margin:0 0 8px 0;">🐻 ヒグマ出没情報</h3>
                <p><strong>日時:</strong> ${date} ${time}</p>
                <p><strong>場所:</strong> ${location}</p>
                <p><strong>状況:</strong> ${situation}</p>
                <hr style="border-color:#666;margin:12px 0;">
                <h4 style="margin:0 0 8px 0;">🏃 避難場所スコア</h4>
                <p><strong>最寄り建物まで:</strong> <span style="font-size:18px;font-weight:bold;">${distanceText}</span></p>
                <p>${levelText}</p>
              </div>`}
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
        {/* 避難場所スコア凡例 */}
        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>🏃 避難場所スコア</div>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#32CD32',
                borderRadius: '50%',
                border: '2px solid white',
              }}
            />
            <span style={{ fontSize: '12px' }}>50m以内（逃げやすい）</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#FFD700',
                borderRadius: '50%',
                border: '2px solid white',
              }}
            />
            <span style={{ fontSize: '12px' }}>50-200m（やや遠い）</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: '#FF0000',
                borderRadius: '50%',
                border: '2px solid white',
              }}
            />
            <span style={{ fontSize: '12px' }}>200m超（逃げ場が遠い）</span>
          </div>
        </div>
        <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '12px' }}>
          ※ マーカーをクリックで詳細表示
        </div>

        {/* ヒートマップ凡例 */}
        <div style={{ paddingTop: '12px', borderTop: '1px solid #444', marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🗺️ エリア安全度</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div
              style={{
                width: '20px',
                height: '12px',
                backgroundColor: 'rgba(0, 180, 80, 0.7)',
                borderRadius: '2px',
              }}
            />
            <span style={{ fontSize: '12px' }}>建物多い</span>
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
            <span style={{ fontSize: '12px' }}>やや少ない</span>
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
            <span style={{ fontSize: '12px' }}>建物少ない</span>
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
