/**
 * 建物データを軽量化するスクリプト
 *
 * - ヒグマ出没地点から1km以内の建物のみ抽出
 * - 座標のみに絞り込み（プロパティを削除）
 *
 * 使用方法:
 * npx tsx scripts/optimize-buildings.ts
 */

import fs from 'fs';
import path from 'path';

// ヒグマ出没データを読み込み
const bearDataPath = path.join(__dirname, '../app/src/data/bear_sightings.json');
const bearData = JSON.parse(fs.readFileSync(bearDataPath, 'utf-8'));

// 建物データを読み込み
const buildingsPath = path.join(__dirname, '../app/src/data/buildings.json');
const buildingsData = JSON.parse(fs.readFileSync(buildingsPath, 'utf-8'));

console.log(`ヒグマ出没地点: ${bearData.features.length}件`);
console.log(`全建物数: ${buildingsData.features.length}件`);

// Haversine距離計算（km単位）
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 地球の半径（km）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ヒグマ出没地点の座標リスト
interface Feature {
  geometry: {
    coordinates: [number, number];
  };
}

const bearLocations = bearData.features.map((f: Feature) => ({
  lon: f.geometry.coordinates[0],
  lat: f.geometry.coordinates[1],
}));

// 出没地点から1km以内の建物を抽出
const maxDistance = 1; // km
const nearbyBuildingsSet = new Set<string>();

console.log('\n近接建物を抽出中...');

for (const building of buildingsData.features) {
  const [bLon, bLat] = building.geometry.coordinates;

  for (const bear of bearLocations) {
    const distance = haversineDistance(bear.lat, bear.lon, bLat, bLon);
    if (distance <= maxDistance) {
      // 座標をキーとして重複排除
      const key = `${bLon.toFixed(6)},${bLat.toFixed(6)}`;
      nearbyBuildingsSet.add(key);
      break;
    }
  }
}

console.log(`抽出された建物: ${nearbyBuildingsSet.size}件`);

// 座標のみの配列として保存（軽量化）
const nearbyBuildings = Array.from(nearbyBuildingsSet).map((key) => {
  const [lon, lat] = key.split(',').map(Number);
  return [lon, lat];
});

// 軽量なJSON形式で保存
const output = {
  description: '札幌市の建物データ（ヒグマ出没地点1km以内）',
  source: 'OpenStreetMap contributors',
  license: 'ODbL',
  buildingCount: nearbyBuildings.length,
  // [[lon, lat], [lon, lat], ...]形式で保存
  coordinates: nearbyBuildings,
};

const outputPath = path.join(__dirname, '../app/src/data/buildings-nearby.json');
fs.writeFileSync(outputPath, JSON.stringify(output));
console.log(`\n保存完了: ${outputPath}`);

// ファイルサイズ確認
const stats = fs.statSync(outputPath);
console.log(`ファイルサイズ: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
