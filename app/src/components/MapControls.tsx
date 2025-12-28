import type { Viewer as CesiumViewer } from 'cesium';
import { Cartesian3 } from 'cesium';
import type { RefObject } from 'react';
import { useState } from 'react';
import type { CesiumComponentRef } from 'resium';

interface MapControlsProps {
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer> | null>;
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

export function MapControls({ viewerRef }: MapControlsProps) {
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
    </div>
  );
}
