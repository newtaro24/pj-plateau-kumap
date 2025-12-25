/**
 * 札幌市ヒグマ出没情報の自動更新スクリプト
 *
 * データソース: 札幌市オープンデータプラットフォーム（CKAN）
 * https://ckan.pf-sapporo.jp/dataset/sapporo_bear_appearance
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CKAN API設定
const CKAN_API_URL =
  'https://ckan.pf-sapporo.jp/api/3/action/package_show?id=sapporo_bear_appearance';

interface CKANResource {
  id: string;
  name: string;
  url: string;
  format: string;
}

interface CKANResponse {
  success: boolean;
  result: {
    resources: CKANResource[];
  };
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    date: string;
    time: string;
    ward: string;
    location: string;
    situation: string;
    dangerLevel: string;
  };
}

interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// 状況から危険度を判定
function determineDangerLevel(situation: string): string {
  if (situation.includes('目撃')) {
    return 'high';
  } else if (situation.includes('足跡') || situation.includes('フン')) {
    return 'medium';
  } else {
    return 'low';
  }
}

// CSVテキストをGeoJSONに変換
function convertCSVToGeoJSON(csvContent: string): GeoJSONCollection {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  const dataLines = lines.slice(1); // ヘッダーを除外

  const features: GeoJSONFeature[] = dataLines
    .map((line) => {
      const columns = line.split(',');

      if (columns.length < 7) {
        console.warn('Invalid line:', line);
        return null;
      }

      const [date, time, ward, location, latStr, lonStr, situation] = columns.map(
        (col) => col.trim()
      );

      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);

      if (isNaN(lat) || isNaN(lon)) {
        console.warn('Invalid coordinates:', latStr, lonStr);
        return null;
      }

      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [lon, lat] as [number, number],
        },
        properties: {
          date,
          time,
          ward,
          location,
          situation,
          dangerLevel: determineDangerLevel(situation),
        },
      };
    })
    .filter((f): f is GeoJSONFeature => f !== null);

  return {
    type: 'FeatureCollection',
    features,
  };
}

// CKANから最新の2025年データのURLを取得
async function getLatestDataURL(): Promise<string> {
  console.log('📡 Fetching CKAN metadata...');

  const response = await fetch(CKAN_API_URL);
  if (!response.ok) {
    throw new Error(`CKAN API error: ${response.status}`);
  }

  const data = (await response.json()) as CKANResponse;
  if (!data.success) {
    throw new Error('CKAN API returned unsuccessful response');
  }

  // 2025年のCSVリソースを探す
  const resource2025 = data.result.resources.find(
    (r) => r.name.includes('2025') && r.format.toUpperCase() === 'CSV'
  );

  if (!resource2025) {
    throw new Error('2025 CSV resource not found');
  }

  console.log(`📄 Found: ${resource2025.name}`);
  return resource2025.url;
}

// CSVをダウンロード
async function downloadCSV(url: string): Promise<string> {
  console.log('⬇️  Downloading CSV...');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download error: ${response.status}`);
  }

  // CSVはUTF-8で提供されている
  return response.text();
}

// メイン処理
async function main() {
  try {
    console.log('🐻 Starting bear sighting data update...\n');

    // 1. 最新データのURLを取得
    const csvUrl = await getLatestDataURL();

    // 2. CSVをダウンロード
    const csvContent = await downloadCSV(csvUrl);

    // 3. GeoJSONに変換
    console.log('🔄 Converting to GeoJSON...');
    const geoJSON = convertCSVToGeoJSON(csvContent);

    // 4. ファイルに保存
    const outputPath = path.join(
      __dirname,
      '../app/src/data/bear_sightings_2025.json'
    );
    fs.writeFileSync(outputPath, JSON.stringify(geoJSON, null, 2), 'utf-8');

    console.log(`\n✅ Successfully updated bear sighting data!`);
    console.log(`📊 Total sightings: ${geoJSON.features.length}`);
    console.log(`📁 Output: ${outputPath}`);

    // 件数を出力（GitHub Actionsで使用）
    console.log(`\n::set-output name=count::${geoJSON.features.length}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
