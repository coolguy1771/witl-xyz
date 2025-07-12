import { useState, useCallback, useEffect } from "react";
import { API_ENDPOINTS, API_TIMEOUT } from "../constants";
import type { VisitorData, WeatherData } from "../types";
import { safeJsonParse } from "../utils";

interface UseVisitorDataProps {
  initialData: Partial<VisitorData>;
}

interface UseVisitorDataReturn {
  data: VisitorData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface ApiResponseData {
  geo?: Partial<VisitorData>;
  weather?: WeatherData;
}

export const useVisitorData = ({
  initialData,
}: UseVisitorDataProps): UseVisitorDataReturn => {
  const [data, setData] = useState<VisitorData>({
    ...(initialData as VisitorData),
    weather: null,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!initialLoaded || isRefresh) {
        setLoading(true);
        setError(null);

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

          const response = await fetch(API_ENDPOINTS.VISITOR, {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
              "x-requested-with": "fetch",
            },
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const responseData = (await response.json()) as ApiResponseData;
          console.log("Visitor API response:", responseData);

          if (typeof responseData === "object" && responseData !== null) {
            const updatedData: Partial<VisitorData> = {};

            if (responseData.geo && typeof responseData.geo === "object") {
              Object.assign(updatedData, responseData.geo);
            }

            if (
              responseData.weather &&
              typeof responseData.weather === "object"
            ) {
              updatedData.weather = responseData.weather;
            }

            console.log("Processed visitor data:", updatedData);
            setData(prev => ({ ...prev, ...updatedData }));
          } else {
            console.error("Invalid visitor data:", responseData);
          }
          setInitialLoaded(true);
        } catch (err) {
          if ((err as Error).name === "AbortError") {
            console.log("Request timed out - using initial data");
          } else {
            console.error("Error fetching visitor data:", err);
            setError(
              "Failed to load complete visitor data. Some information may be missing."
            );
          }
        } finally {
          setLoading(false);
        }
      }
    },
    [initialLoaded]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(() => fetchData());
        } else {
          setTimeout(() => fetchData(), 200);
        }
      }, 100);
    }
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: () => fetchData(true),
  };
};
