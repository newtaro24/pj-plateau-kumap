import type { Viewer as CesiumViewer } from 'cesium';
import { Cartesian3, Math as CesiumMath } from 'cesium';
import type { RefObject } from 'react';
import { useState } from 'react';
import type { CesiumComponentRef } from 'resium';

interface MapControlsProps {
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer> | null>;
  showHeatmap?: boolean;
  onToggleHeatmap?: () => void;
}

const controlsContainerStyle: React.CSSProperties = {
  position: 'absolute',
  right: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  zIndex: 1000,
};

const buttonStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  backgroundColor: 'rgba(48, 48, 48, 0.95)',
  border: 'none',
  borderRadius: '8px',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  fontWeight: 300,
  transition: 'background-color 0.15s',
};

const buttonHoverStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: 'rgba(80, 80, 80, 0.95)',
};

const dividerStyle: React.CSSProperties = {
  height: '1px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  margin: '4px 0',
};

// 札幌市の初期位置
const SAPPORO_CENTER = {
  longitude: 141.35,
  latitude: 43.05,
  height: 80000,
};

export function MapControls({ viewerRef, showHeatmap, onToggleHeatmap }: MapControlsProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const getViewer = () => viewerRef.current?.cesiumElement ?? null;

  const handleZoomIn = () => {
    const viewer = getViewer();
    if (!viewer) return;
    const camera = viewer.camera;
    const currentHeight = camera.positionCartographic.height;
    const newHeight = currentHeight * 0.5; // 50%ズームイン

    camera.flyTo({
      destination: Cartesian3.fromRadians(
        camera.positionCartographic.longitude,
        camera.positionCartographic.latitude,
        Math.max(newHeight, 100), // 最低100m
      ),
      duration: 0.3,
    });
  };

  const handleZoomOut = () => {
    const viewer = getViewer();
    if (!viewer) return;
    const camera = viewer.camera;
    const currentHeight = camera.positionCartographic.height;
    const newHeight = currentHeight * 2; // 2倍ズームアウト

    camera.flyTo({
      destination: Cartesian3.fromRadians(
        camera.positionCartographic.longitude,
        camera.positionCartographic.latitude,
        Math.min(newHeight, 500000), // 最大500km
      ),
      duration: 0.3,
    });
  };

  const handleResetNorth = () => {
    const viewer = getViewer();
    if (!viewer) return;
    const camera = viewer.camera;
    camera.flyTo({
      destination: camera.position,
      orientation: {
        heading: 0,
        pitch: camera.pitch,
        roll: 0,
      },
      duration: 0.3,
    });
  };

  const handleResetView = () => {
    const viewer = getViewer();
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        SAPPORO_CENTER.longitude,
        SAPPORO_CENTER.latitude,
        SAPPORO_CENTER.height,
      ),
      orientation: {
        heading: 0,
        pitch: CesiumMath.toRadians(-70),
        roll: 0,
      },
      duration: 0.8,
    });
  };

  const getButtonStyle = (buttonName: string) =>
    hoveredButton === buttonName ? buttonHoverStyle : buttonStyle;

  return (
    <div style={controlsContainerStyle}>
      <button
        type="button"
        style={getButtonStyle('zoomIn')}
        onClick={handleZoomIn}
        onMouseEnter={() => setHoveredButton('zoomIn')}
        onMouseLeave={() => setHoveredButton(null)}
        title="ズームイン"
      >
        +
      </button>

      <button
        type="button"
        style={getButtonStyle('zoomOut')}
        onClick={handleZoomOut}
        onMouseEnter={() => setHoveredButton('zoomOut')}
        onMouseLeave={() => setHoveredButton(null)}
        title="ズームアウト"
      >
        −
      </button>

      <div style={dividerStyle} />

      <button
        type="button"
        style={getButtonStyle('resetNorth')}
        onClick={handleResetNorth}
        onMouseEnter={() => setHoveredButton('resetNorth')}
        onMouseLeave={() => setHoveredButton(null)}
        title="北向きにリセット"
      >
        N
      </button>

      <button
        type="button"
        style={getButtonStyle('resetView')}
        onClick={handleResetView}
        onMouseEnter={() => setHoveredButton('resetView')}
        onMouseLeave={() => setHoveredButton(null)}
        title="札幌市全体を表示"
      >
        ◎
      </button>

      {onToggleHeatmap && (
        <>
          <div style={dividerStyle} />
          <button
            type="button"
            style={{
              ...getButtonStyle('heatmap'),
              backgroundColor: showHeatmap
                ? 'rgba(229, 57, 53, 0.9)'
                : getButtonStyle('heatmap').backgroundColor,
            }}
            onClick={onToggleHeatmap}
            onMouseEnter={() => setHoveredButton('heatmap')}
            onMouseLeave={() => setHoveredButton(null)}
            title={showHeatmap ? 'ヒートマップを非表示' : 'ヒートマップを表示'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="12" r="10" opacity="0.3" />
              <circle cx="12" cy="12" r="6" opacity="0.5" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
