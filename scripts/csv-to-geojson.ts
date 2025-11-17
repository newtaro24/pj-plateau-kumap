import * as fs from 'fs';
import * as path from 'path';

interface BearSighting {
  日付: string;
  時刻: string;
  区: string;
  出没場所: string;
  緯度: string;
  経度: string;
  状況: string;
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

// 状況から危険度を判定する関数
function determineDangerLevel(situation: string): string {
  if (situation.includes('目撃')) {
    return 'high';
  } else if (situation.includes('足跡') || situation.includes('フン')) {
    return 'medium';
  } else {
    return 'low';
  }
}

// CSVを読み込んでGeoJSONに変換
function convertCSVToGeoJSON(csvPath: string, outputPath: string) {
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  // ヘッダーを除外（BOM付きの可能性があるので注意）
  const dataLines = lines.slice(1);

  const features: GeoJSONFeature[] = dataLines.map(line => {
    // CSVパースのシンプル実装（カンマ区切り）
    const columns = line.split(',');

    if (columns.length < 7) {
      console.warn('Invalid line:', line);
      return null;
    }

    const [date, time, ward, location, latStr, lonStr, situation] = columns;

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      console.warn('Invalid coordinates:', latStr, lonStr);
      return null;
    }

    const feature: GeoJSONFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lon, lat], // GeoJSONは [経度, 緯度] の順
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

    return feature;
  }).filter((f): f is GeoJSONFeature => f !== null);

  const geoJSON: GeoJSONCollection = {
    type: 'FeatureCollection',
    features,
  };

  fs.writeFileSync(outputPath, JSON.stringify(geoJSON, null, 2), 'utf-8');
  console.log(`✅ Converted ${features.length} bear sightings to GeoJSON`);
  console.log(`📁 Output: ${outputPath}`);
}

// メイン処理
// コマンドライン引数でCSVファイルのパスを受け取る
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: npm run convert-data <csv-file-path>');
  console.error('Example: npm run convert-data ./bear_sightings_2025.csv');
  process.exit(1);
}

const csvPath = path.resolve(args[0]);
const outputPath = path.join(__dirname, '../app/src/data/bear_sightings_2025.json');

if (!fs.existsSync(csvPath)) {
  console.error(`❌ Error: CSV file not found: ${csvPath}`);
  process.exit(1);
}

convertCSVToGeoJSON(csvPath, outputPath);
