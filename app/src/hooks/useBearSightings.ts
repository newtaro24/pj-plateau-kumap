import { useState, useEffect } from 'react';

export interface BearSighting {
  type: string;
  geometry: {
    type: string;
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

interface GeoJSONData {
  type: string;
  features: BearSighting[];
}

export function useBearSightings(url: string) {
  const [data, setData] = useState<BearSighting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const json: GeoJSONData = await response.json();

        if (!ignore) {
          setData(json.features);
          console.log(`✅ Loaded ${json.features.length} bear sightings`);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          console.error('Error loading bear data:', err);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [url]);

  return { data, isLoading, error };
}
