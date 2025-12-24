/**
 * OSM Overpass APIから札幌市の建物データを取得するスクリプト
 *
 * 使用方法:
 * npx tsx scripts/fetch-osm-buildings.ts
 */

import fs from 'fs';
import path from 'path';

// ヒグマ出没データを読み込んで範囲を計算
const bearDataPath = path.join(__dirname, '../app/src/data/bear_sightings_2025.json');
const bearData = JSON.parse(fs.readFileSync(bearDataPath, 'utf-8'));

interface Feature {
  geometry: {
    coordinates: [number, number];
  };
}

// 座標の範囲を計算
let minLon = Infinity, maxLon = -Infinity;
let minLat = Infinity, maxLat = -Infinity;

bearData.features.forEach((feature: Feature) => {
  const [lon, lat] = feature.geometry.coordinates;
  minLon = Math.min(minLon, lon);
  maxLon = Math.max(maxLon, lon);
  minLat = Math.min(minLat, lat);
  maxLat = Math.max(maxLat, lat);
});

// バッファを追加（約1km）
const buffer = 0.01;
minLon -= buffer;
maxLon += buffer;
minLat -= buffer;
maxLat += buffer;

console.log('ヒグマ出没データの範囲:');
console.log(`  緯度: ${minLat.toFixed(4)} - ${maxLat.toFixed(4)}`);
console.log(`  経度: ${minLon.toFixed(4)} - ${maxLon.toFixed(4)}`);

// Overpass APIクエリ
const overpassQuery = `
[out:json][timeout:300];
(
  way["building"](${minLat},${minLon},${maxLat},${maxLon});
  relation["building"](${minLat},${minLon},${maxLat},${maxLon});
);
out center;
`;

console.log('\nOverpass APIクエリ:');
console.log(overpassQuery);

// Overpass APIにリクエスト
async function fetchBuildings() {
  console.log('\nOverpass APIにリクエスト中...');

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `data=${encodeURIComponent(overpassQuery)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`取得した建物数: ${data.elements.length}`);

  // GeoJSONに変換
  interface OSMElement {
    type: string;
    id: number;
    center?: { lat: number; lon: number };
    lat?: number;
    lon?: number;
    tags?: Record<string, string>;
  }

  const geojson = {
    type: 'FeatureCollection',
    description: '札幌市の建物データ（OpenStreetMapより取得）',
    source: 'OpenStreetMap contributors',
    license: 'ODbL',
    fetchedAt: new Date().toISOString(),
    features: data.elements
      .filter((el: OSMElement) => el.center || (el.lat && el.lon))
      .map((el: OSMElement) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: el.center
            ? [el.center.lon, el.center.lat]
            : [el.lon, el.lat],
        },
        properties: {
          id: `${el.type}/${el.id}`,
          type: el.tags?.building || 'yes',
          name: el.tags?.name || null,
        },
      })),
  };

  // 保存
  const outputPath = path.join(__dirname, '../app/src/data/buildings.json');
  fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
  console.log(`\n保存完了: ${outputPath}`);
  console.log(`GeoJSON内の建物数: ${geojson.features.length}`);
}

fetchBuildings().catch(console.error);
