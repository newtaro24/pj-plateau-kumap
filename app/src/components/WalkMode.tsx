import { Cartesian3, Cartographic, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium';
import { useEffect, useRef, useState } from 'react';
import { useCesium } from 'resium';

interface WalkModeProps {
  enabled: boolean;
  onExit: () => void;
  startPosition?: { lon: number; lat: number } | null;
}

// モバイル判定
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

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

  // 仮想ジョイスティック用の状態
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickStartRef = useRef({ x: 0, y: 0 });
  const [mobile] = useState(isMobile());

  useEffect(() => {
    if (!viewer || !enabled) return;

    const scene = viewer.scene;
    const canvas = viewer.canvas;
    const camera = scene.camera;

    // 開始位置にカメラを移動
    if (startPosition) {
      const cartographic = Cartographic.fromDegrees(startPosition.lon, startPosition.lat);

      // 地形の高さを取得（globe.getHeightがメイン、sampleHeightは3D Tiles用）
      let groundHeight = 0;

      // まず地形から高さを取得
      const terrainHeight = scene.globe.getHeight(cartographic);
      if (terrainHeight !== undefined && terrainHeight > 0) {
        groundHeight = terrainHeight;
      }

      // 3D Tilesからも高さを取得（建物の上に立てるように）
      if (scene.sampleHeightSupported) {
        const sampledHeight = scene.sampleHeight(cartographic);
        if (sampledHeight !== undefined && sampledHeight > groundHeight) {
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

    // タッチイベント（視点変更用 - モバイル対応）
    let cleanupTouch: (() => void) | null = null;
    if (mobile) {
      let touchStartPos: { x: number; y: number } | null = null;

      const handleTouchStart = (e: TouchEvent) => {
        // 仮想ジョイスティック以外のタッチは視点変更に使う
        const target = e.target as HTMLElement;
        if (target.classList.contains('joystick-area')) return;

        if (e.touches.length === 1) {
          const touch = e.touches[0];
          touchStartPos = { x: touch.clientX, y: touch.clientY };
          flagsRef.current.looking = true;
          mouseRef.current.startX = touch.clientX;
          mouseRef.current.startY = touch.clientY;
          mouseRef.current.currentX = touch.clientX;
          mouseRef.current.currentY = touch.clientY;
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 1 && touchStartPos) {
          const touch = e.touches[0];
          mouseRef.current.currentX = touch.clientX;
          mouseRef.current.currentY = touch.clientY;
        }
      };

      const handleTouchEnd = () => {
        touchStartPos = null;
        flagsRef.current.looking = false;
      };

      canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
      canvas.addEventListener('touchend', handleTouchEnd);

      cleanupTouch = () => {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      };
    }

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

      // 仮想ジョイスティックによる移動（モバイル用）
      if (mobile && joystickActive) {
        const threshold = 10; // ジョイスティックの遊び
        if (joystickPos.y < -threshold) flags.moveForward = true;
        else flags.moveForward = false;
        if (joystickPos.y > threshold) flags.moveBackward = true;
        else flags.moveBackward = false;
        if (joystickPos.x < -threshold) flags.moveLeft = true;
        else flags.moveLeft = false;
        if (joystickPos.x > threshold) flags.moveRight = true;
        else flags.moveRight = false;
      }

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

      // 高度を地面に合わせる（地形 + 3D Tilesから取得 + 人間の目線 1.7m）
      const cartographic = Cartographic.fromCartesian(camera.position);
      const eyeHeight = 1.7;

      let groundHeight = 0;

      // 地形から高さを取得
      const terrainHeight = scene.globe.getHeight(cartographic);
      if (terrainHeight !== undefined && terrainHeight > 0) {
        groundHeight = terrainHeight;
      }

      // 3D Tilesからも高さを取得（より高い方を採用）
      if (scene.sampleHeightSupported) {
        const sampledHeight = scene.sampleHeight(cartographic);
        if (sampledHeight !== undefined && sampledHeight > groundHeight) {
          groundHeight = sampledHeight;
        }
      }

      const targetHeight = groundHeight + eyeHeight;
      // 地面との差が大きい場合のみ補正（滑らかに）
      const heightDiff = targetHeight - cartographic.height;
      if (Math.abs(heightDiff) > 0.1) {
        // 急激な変化を避けるため、徐々に補正
        cartographic.height += heightDiff * 0.3;
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

      if (cleanupTouch) {
        cleanupTouch();
      }

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
  }, [viewer, enabled, onExit, startPosition, mobile, joystickActive, joystickPos]);

  if (!enabled) return null;

  // 仮想ジョイスティックのイベントハンドラー
  const handleJoystickStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    joystickStartRef.current = { x: centerX, y: centerY };
    setJoystickActive(true);
    setJoystickPos({ x: touch.clientX - centerX, y: touch.clientY - centerY });
  };

  const handleJoystickMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!joystickActive) return;
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - joystickStartRef.current.x;
    const deltaY = touch.clientY - joystickStartRef.current.y;
    // 最大移動距離を制限
    const maxDistance = 50;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > maxDistance) {
      const ratio = maxDistance / distance;
      setJoystickPos({ x: deltaX * ratio, y: deltaY * ratio });
    } else {
      setJoystickPos({ x: deltaX, y: deltaY });
    }
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    // 移動フラグをリセット
    flagsRef.current.moveForward = false;
    flagsRef.current.moveBackward = false;
    flagsRef.current.moveLeft = false;
    flagsRef.current.moveRight = false;
  };

  return (
    <>
      {/* 仮想ジョイスティック（モバイル用） */}
      {mobile && (
        <div
          className="joystick-area"
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            width: '120px',
            height: '120px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '50%',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            zIndex: 1001,
            touchAction: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '50px',
              height: '50px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '50%',
              transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`,
              transition: joystickActive ? 'none' : 'transform 0.2s',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* 終了ボタン（モバイル用） */}
      {mobile && (
        <button
          type="button"
          onClick={onExit}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}
        >
          ✕
        </button>
      )}

      {/* 操作説明パネル */}
      <div
        style={{
          position: 'absolute',
          bottom: mobile ? '160px' : '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          padding: mobile ? '12px 16px' : '16px 24px',
          borderRadius: '12px',
          fontSize: mobile ? '12px' : '14px',
          zIndex: 1000,
          textAlign: 'center',
          minWidth: mobile ? '200px' : '300px',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: mobile ? '14px' : '16px' }}>
          🚶 ウォークモード {isInitialized ? '(有効)' : '(初期化中...)'}
        </div>
        {!mobile && (
          <>
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
          </>
        )}
        {mobile && (
          <div style={{ fontSize: '11px', color: '#aaa' }}>
            左: ジョイスティックで移動 / 右: スワイプで視点変更
          </div>
        )}
      </div>
    </>
  );
}
