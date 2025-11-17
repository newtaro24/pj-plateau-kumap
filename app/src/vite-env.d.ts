/// <reference types="vite/client" />

// GeoJSON ファイルのインポート型定義
declare module '*.geojson' {
  const value: {
    type: string;
    features: Array<{
      type: string;
      geometry: {
        type: string;
        coordinates: [number, number];
      };
      properties: Record<string, unknown>;
    }>;
  };
  export default value;
}

interface ImportMetaEnv {
  readonly VITE_CESIUM_ION_TOKEN: string;
  readonly VITE_CESIUM_ASSET_ID_CHUO: string;
  readonly VITE_CESIUM_ASSET_ID_MINAMI: string;
  readonly VITE_CESIUM_ASSET_ID_NISHI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
