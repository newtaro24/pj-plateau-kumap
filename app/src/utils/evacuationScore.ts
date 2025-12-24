/**
 * 避難場所スコア計算ユーティリティ
 *
 * 出没地点から最寄り建物までの距離を計算
 */

import buildingsData from '../data/buildings-nearby.json';

// 建物座標: [[lon, lat], ...]
const buildingCoords = buildingsData.coordinates as [number, number][];

/**
 * Haversine距離計算（メートル単位）
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // 地球の半径（メートル）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 最寄り建物までの距離を計算（メートル単位）
 */
export function findNearestBuildingDistance(lon: number, lat: number): number {
  let minDistance = Infinity;

  for (const [bLon, bLat] of buildingCoords) {
    const distance = haversineDistance(lat, lon, bLat, bLon);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }

  return Math.round(minDistance);
}

/**
 * 距離に応じた避難レベルを返す
 */
export function getEvacuationLevel(distance: number): 'safe' | 'caution' | 'danger' {
  if (distance <= 50) {
    return 'safe'; // 50m以内: 安全（すぐに逃げ込める）
  } else if (distance <= 200) {
    return 'caution'; // 200m以内: 注意（走れば逃げられる）
  } else {
    return 'danger'; // 200m超: 危険（逃げ場が遠い）
  }
}

/**
 * 距離を人間が読みやすい形式に変換
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

// 建物総数（デバッグ用）
export const buildingCount = buildingCoords.length;
