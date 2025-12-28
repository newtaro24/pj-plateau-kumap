import type { Viewer as CesiumViewer } from 'cesium';
import { Cartesian2, Cartesian3, Math as CesiumMath, HeadingPitchRange } from 'cesium';
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

  // 視点の中心を軸にカメラを回転させる
  const rotateAroundCenter = (angleDegrees: number) => {
    const viewer = getViewer();
    if (!viewer) return;

    const camera = viewer.camera;
    const scene = viewer.scene;

    // 画面中央の地点を取得
    const canvas = scene.canvas;
    const center = new Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2);
    const ray = camera.getPickRay(center);
    if (!ray) return;

    // 地表との交点を取得
    const intersection = scene.globe.pick(ray, scene);
    if (!intersection) {
      // 交点が見つからない場合は従来の回転
      camera.flyTo({
        destination: camera.positionWC,
        orientation: {
          heading: camera.heading + CesiumMath.toRadians(angleDegrees),
          pitch: camera.pitch,
          roll: camera.roll,
        },
        duration: 0.5,
      });
      return;
    }

    // 現在のカメラ位置から中心までの距離を計算
    const distance = Cartesian3.distance(camera.positionWC, intersection);
    const newHeading = camera.heading + CesiumMath.toRadians(angleDegrees);

    // 中心を軸に回転した新しいカメラ位置を計算
    camera.flyTo({
      destination: intersection,
      orientation: new HeadingPitchRange(newHeading, camera.pitch, distance),
      duration: 0.5,
    });
  };

  const handleRotateLeft = () => rotateAroundCenter(-15);
  const handleRotateRight = () => rotateAroundCenter(15);

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

      <div style={{ height: '8px' }} />

      <button
        type="button"
        style={getButtonStyle('rotateLeft')}
        onClick={handleRotateLeft}
        onMouseEnter={() => setHoveredButton('rotateLeft')}
        onMouseLeave={() => setHoveredButton(null)}
        title="左に回転"
      >
        ↺
      </button>

      <button
        type="button"
        style={getButtonStyle('rotateRight')}
        onClick={handleRotateRight}
        onMouseEnter={() => setHoveredButton('rotateRight')}
        onMouseLeave={() => setHoveredButton(null)}
        title="右に回転"
      >
        ↻
      </button>
    </div>
  );
}
