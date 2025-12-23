import { Cartesian3, Cartographic, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium';
import { useEffect, useRef, useState } from 'react';
import { useCesium } from 'resium';

interface WalkModeProps {
  enabled: boolean;
  onExit: () => void;
  startPosition?: { lon: number; lat: number } | null;
}

export function WalkMode({ enabled, onExit, startPosition }: WalkModeProps) {
  const { viewer } = useCesium();
  const flagsRef = useRef({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    looking: false,
  });
  const mouseRef = useRef({ startX: 0, startY: 0, currentX: 0, currentY: 0 });
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);
  const tickListenerRef = useRef<(() => void) | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!viewer || !enabled) return;

    const scene = viewer.scene;
    const canvas = viewer.canvas;
    const camera = scene.camera;

    // 開始位置にカメラを移動
    if (startPosition) {
      const cartographic = Cartographic.fromDegrees(startPosition.lon, startPosition.lat);

      // 3D Tilesや地形から高さを取得
      let groundHeight = 0;
      if (scene.sampleHeightSupported) {
        const sampledHeight = scene.sampleHeight(cartographic);
        if (sampledHeight !== undefined && sampledHeight > 0) {
          groundHeight = sampledHeight;
        }
      }

      const eyeHeight = 1.7; // 人間の目線高さ
      const startCartesian = Cartesian3.fromDegrees(
        startPosition.lon,
        startPosition.lat,
        groundHeight + eyeHeight,
      );

      camera.setView({
        destination: startCartesian,
        orientation: {
          heading: 0, // 北向き
          pitch: 0, // 水平
          roll: 0,
        },
      });
    }

    // フォーカス設定
    canvas.setAttribute('tabindex', '0');
    canvas.focus();

    // デフォルトのカメラコントロールを無効化
    scene.screenSpaceCameraController.enableRotate = false;
    scene.screenSpaceCameraController.enableTranslate = false;
    scene.screenSpaceCameraController.enableZoom = false;
    scene.screenSpaceCameraController.enableTilt = false;
    scene.screenSpaceCameraController.enableLook = false;

    // マウスイベントハンドラー
    const handler = new ScreenSpaceEventHandler(canvas);
    handlerRef.current = handler;

    handler.setInputAction((movement: { position: { x: number; y: number } }) => {
      flagsRef.current.looking = true;
      mouseRef.current.startX = movement.position.x;
      mouseRef.current.startY = movement.position.y;
      mouseRef.current.currentX = movement.position.x;
      mouseRef.current.currentY = movement.position.y;
    }, ScreenSpaceEventType.LEFT_DOWN);

    handler.setInputAction((movement: { endPosition: { x: number; y: number } }) => {
      mouseRef.current.currentX = movement.endPosition.x;
      mouseRef.current.currentY = movement.endPosition.y;
    }, ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(() => {
      flagsRef.current.looking = false;
    }, ScreenSpaceEventType.LEFT_UP);

    // キーボードイベント
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          flagsRef.current.moveForward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          flagsRef.current.moveBackward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          flagsRef.current.moveLeft = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          flagsRef.current.moveRight = true;
          break;
        case 'Escape':
          onExit();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          flagsRef.current.moveForward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          flagsRef.current.moveBackward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          flagsRef.current.moveLeft = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          flagsRef.current.moveRight = false;
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // 毎フレームの更新処理
    const moveSpeed = 5.0; // メートル/フレーム
    const lookSpeed = 0.002;

    const tickListener = () => {
      const flags = flagsRef.current;
      const mouse = mouseRef.current;

      // マウスで見回し
      if (flags.looking) {
        const deltaX = mouse.currentX - mouse.startX;
        const deltaY = mouse.currentY - mouse.startY;

        camera.lookRight(deltaX * lookSpeed);
        camera.lookUp(-deltaY * lookSpeed);

        mouse.startX = mouse.currentX;
        mouse.startY = mouse.currentY;
      }

      // WASD移動（地面に沿って移動）
      if (flags.moveForward) {
        camera.moveForward(moveSpeed);
      }
      if (flags.moveBackward) {
        camera.moveBackward(moveSpeed);
      }
      if (flags.moveLeft) {
        camera.moveLeft(moveSpeed);
      }
      if (flags.moveRight) {
        camera.moveRight(moveSpeed);
      }

      // 高度を地面に合わせる（3D Tilesから取得 + 人間の目線 1.7m）
      const cartographic = Cartographic.fromCartesian(camera.position);
      const eyeHeight = 1.7;

      let groundHeight = 0;
      if (scene.sampleHeightSupported) {
        const sampledHeight = scene.sampleHeight(cartographic);
        if (sampledHeight !== undefined && sampledHeight > 0) {
          groundHeight = sampledHeight;
        }
      }

      const targetHeight = groundHeight + eyeHeight;
      if (Math.abs(cartographic.height - targetHeight) > 0.5) {
        cartographic.height = targetHeight;
        camera.position = Cartographic.toCartesian(cartographic);
      }
    };

    tickListenerRef.current = tickListener;
    viewer.clock.onTick.addEventListener(tickListener);

    setIsInitialized(true);

    // クリーンアップ
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);

      if (handlerRef.current) {
        handlerRef.current.destroy();
        handlerRef.current = null;
      }

      if (tickListenerRef.current) {
        viewer.clock.onTick.removeEventListener(tickListenerRef.current);
        tickListenerRef.current = null;
      }

      // デフォルトのカメラコントロールを復元
      scene.screenSpaceCameraController.enableRotate = true;
      scene.screenSpaceCameraController.enableTranslate = true;
      scene.screenSpaceCameraController.enableZoom = true;
      scene.screenSpaceCameraController.enableTilt = true;
      scene.screenSpaceCameraController.enableLook = true;

      setIsInitialized(false);
    };
  }, [viewer, enabled, onExit, startPosition]);

  if (!enabled) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        zIndex: 1000,
        textAlign: 'center',
        minWidth: '300px',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
        🚶 ウォークモード {isInitialized ? '(有効)' : '(初期化中...)'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>移動</div>
          <div style={{ fontFamily: 'monospace', fontSize: '16px' }}>
            <span style={{ opacity: 0.5 }}>　</span>W<span style={{ opacity: 0.5 }}>　</span>
            <br />A S D
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>見回し</div>
          <div>マウスドラッグ</div>
        </div>
      </div>
      <div style={{ fontSize: '12px', color: '#888' }}>ESC キーで終了</div>
    </div>
  );
}
