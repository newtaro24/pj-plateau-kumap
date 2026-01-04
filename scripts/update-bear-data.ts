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

// 現在の年を取得
function getCurrentYear(): number {
  return new Date().getFullYear();
}

// CKANから指定年のデータURLを取得
async function getDataURLForYear(year: number): Promise<string | null> {
  console.log(`📡 Fetching CKAN metadata for ${year}...`);

  const response = await fetch(CKAN_API_URL);
  if (!response.ok) {
    throw new Error(`CKAN API error: ${response.status}`);
  }

  const data = (await response.json()) as CKANResponse;
  if (!data.success) {
    throw new Error('CKAN API returned unsuccessful response');
  }

  // 指定年のCSVリソースを探す
  const resource = data.result.resources.find(
    (r) => r.name.includes(String(year)) && r.format.toUpperCase() === 'CSV'
  );

  if (!resource) {
    return null;
  }

  console.log(`📄 Found: ${resource.name}`);
  return resource.url;
}

// CKANから最新年のデータURLを取得（現在年→前年の順で探す）
async function getLatestDataURL(): Promise<{ url: string; year: number }> {
  const currentYear = getCurrentYear();

  // 現在の年を試す
  let url = await getDataURLForYear(currentYear);
  if (url) {
    return { url, year: currentYear };
  }

  // なければ前年を試す
  const lastYear = currentYear - 1;
  url = await getDataURLForYear(lastYear);
  if (url) {
    return { url, year: lastYear };
  }

  throw new Error(`No CSV resource found for ${currentYear} or ${lastYear}`);
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
    const { url: csvUrl, year } = await getLatestDataURL();

    // 2. CSVをダウンロード
    const csvContent = await downloadCSV(csvUrl);

    // 3. GeoJSONに変換
    console.log('🔄 Converting to GeoJSON...');
    const geoJSON = convertCSVToGeoJSON(csvContent);

    // 4. ファイルに保存（固定ファイル名）
    const outputPath = path.join(__dirname, '../app/src/data/bear_sightings.json');
    fs.writeFileSync(outputPath, JSON.stringify(geoJSON, null, 2), 'utf-8');

    console.log(`\n✅ Successfully updated bear sighting data!`);
    console.log(`📊 Year: ${year}`);
    console.log(`📊 Total sightings: ${geoJSON.features.length}`);
    console.log(`📁 Output: ${outputPath}`);

    // GitHub Actionsで使用する出力
    const outputFile = process.env.GITHUB_OUTPUT;
    if (outputFile) {
      fs.appendFileSync(outputFile, `count=${geoJSON.features.length}\n`);
      fs.appendFileSync(outputFile, `year=${year}\n`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
