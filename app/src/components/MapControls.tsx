import type { Viewer as CesiumViewer } from 'cesium';
import { Cartesian3, Math as CesiumMath } from 'cesium';
import type { RefObject } from 'react';
import { useState } from 'react';
import type { CesiumComponentRef } from 'resium';
import { useIsMobile } from '../hooks/useIsMobile';

interface MapControlsProps {
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer> | null>;
  lightingEnabled?: boolean;
  onToggleLighting?: () => void;
  currentDateTime?: { date: string; time: string } | null;
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

const buttonActiveStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#a1785b',
};

export function MapControls({
  viewerRef,
  lightingEnabled,
  onToggleLighting,
  currentDateTime,
}: MapControlsProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const isMobile = useIsMobile();

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

  // カメラの向きだけを変更（位置は固定、アニメーション付き）
  const handleRotate = (angleDegrees: number) => {
    const viewer = getViewer();
    if (!viewer) return;

    const camera = viewer.camera;
    const newHeading = camera.heading + CesiumMath.toRadians(angleDegrees);

    camera.flyTo({
      destination: camera.positionWC,
      orientation: {
        heading: newHeading,
        pitch: camera.pitch,
        roll: camera.roll,
      },
      duration: 0.3,
    });
  };

  const handleRotateLeft = () => handleRotate(-10);
  const handleRotateRight = () => handleRotate(10);

  const getButtonStyle = (buttonName: string) =>
    hoveredButton === buttonName ? buttonHoverStyle : buttonStyle;

  // モバイル用のコンテナスタイル（上部固定、小さめボタン）
  const mobileContainerStyle: React.CSSProperties = {
    ...controlsContainerStyle,
    top: '80px', // フィルターの下に配置
    transform: 'none',
    right: '8px',
    gap: '6px',
  };

  const mobileButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    width: '36px',
    height: '36px',
    fontSize: '18px',
  };

  const getMobileButtonStyle = (buttonName: string) => {
    if (hoveredButton === buttonName) {
      return { ...mobileButtonStyle, backgroundColor: 'rgba(80, 80, 80, 0.95)' };
    }
    return mobileButtonStyle;
  };

  const mobileButtonActiveStyle: React.CSSProperties = {
    ...mobileButtonStyle,
    backgroundColor: '#a1785b',
  };

  return (
    <div style={isMobile ? mobileContainerStyle : controlsContainerStyle}>
      <button
        type="button"
        style={isMobile ? getMobileButtonStyle('zoomIn') : getButtonStyle('zoomIn')}
        onClick={handleZoomIn}
        onMouseEnter={() => setHoveredButton('zoomIn')}
        onMouseLeave={() => setHoveredButton(null)}
        title="ズームイン"
      >
        +
      </button>

      <button
        type="button"
        style={isMobile ? getMobileButtonStyle('zoomOut') : getButtonStyle('zoomOut')}
        onClick={handleZoomOut}
        onMouseEnter={() => setHoveredButton('zoomOut')}
        onMouseLeave={() => setHoveredButton(null)}
        title="ズームアウト"
      >
        −
      </button>

      <div style={{ height: isMobile ? '4px' : '8px' }} />

      <button
        type="button"
        style={isMobile ? getMobileButtonStyle('rotateLeft') : getButtonStyle('rotateLeft')}
        onClick={handleRotateLeft}
        onMouseEnter={() => setHoveredButton('rotateLeft')}
        onMouseLeave={() => setHoveredButton(null)}
        title="左に回転"
      >
        ↺
      </button>

      <button
        type="button"
        style={isMobile ? getMobileButtonStyle('rotateRight') : getButtonStyle('rotateRight')}
        onClick={handleRotateRight}
        onMouseEnter={() => setHoveredButton('rotateRight')}
        onMouseLeave={() => setHoveredButton(null)}
        title="右に回転"
      >
        ↻
      </button>

      {onToggleLighting && (
        <>
          <div style={{ height: isMobile ? '4px' : '8px' }} />
          <button
            type="button"
            style={
              lightingEnabled
                ? isMobile
                  ? mobileButtonActiveStyle
                  : buttonActiveStyle
                : isMobile
                  ? getMobileButtonStyle('lighting')
                  : getButtonStyle('lighting')
            }
            onClick={onToggleLighting}
            onMouseEnter={() => setHoveredButton('lighting')}
            onMouseLeave={() => setHoveredButton(null)}
            title="日照シミュレーション"
          >
            ☀
          </button>
          {lightingEnabled && currentDateTime && !isMobile && (
            <div
              style={{
                backgroundColor: 'rgba(48, 48, 48, 0.95)',
                borderRadius: '6px',
                padding: '6px 8px',
                color: '#fff',
                fontSize: '11px',
                textAlign: 'center',
                lineHeight: 1.3,
                marginTop: '4px',
              }}
            >
              <div style={{ opacity: 0.7 }}>{currentDateTime.date}</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{currentDateTime.time}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
