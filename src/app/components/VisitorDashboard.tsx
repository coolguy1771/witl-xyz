"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { Globe, Loader2, Cloud, Thermometer, MapPin } from "lucide-react";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
}

interface VisitorData {
  ip: string | null;
  city: string | null;
  country: string | null;
  latitude: string | null;
  longitude: string | null;
  region: string | null;
  timezone: string | null;
  weather?: WeatherData;
}

interface Props {
  initialData: VisitorData;
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Loading Header */}
        <div className="text-center mb-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-foreground" />
            <h2 className="text-foreground text-xl">
              Loading your information...
            </h2>
          </div>
        </div>

        {/* Loading Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Loading Card Skeletons */}
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow-lg bg-background border-gray-700">
              <CardHeader className="flex flex-row items-center space-x-4">
                <div className="w-6 h-6 rounded-full bg-gray-700 animate-pulse" />
                <div className="h-6 w-24 bg-gray-700 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VisitorDashboard({ initialData }: Props) {
  const [data, setData] = useState<VisitorData>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeatherData() {
      if (data.latitude && data.longitude) {
        try {
          const weatherData = {
            temp: 18,
            condition: "Partly Cloudy",
            humidity: 65,
          };

          setData((prev) => ({
            ...prev,
            weather: weatherData,
          }));
        } catch (error) {
          console.error("Error fetching weather:", error);
        }
      }
      setLoading(false);
    }

    fetchWeatherData();
  }, [data.latitude, data.longitude]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome to You
          </h1>
          <p className="text-lg text-gray-300">
            Here&apos;s what we know about your connection
          </p>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* IP Address Card */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-200 bg-background border-gray-700">
            <CardHeader className="flex flex-row items-center space-x-4">
              <Globe className="h-6 w-6 text-blue-400" />
              <CardTitle className="text-foreground">IP Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">
                {data.ip || "Unknown"}
              </p>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-200 bg-background border-gray-700">
            <CardHeader className="flex flex-row items-center space-x-4">
              <MapPin className="h-6 w-6 text-green-400" />
              <CardTitle className="text-foreground">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-semibold text-foreground">
                  {data.city || "Unknown"}, {data.country || "Unknown"}
                </p>
                {data.region && (
                  <p className="text-gray-300">Region: {data.region}</p>
                )}
                {data.timezone && (
                  <p className="text-gray-300">Timezone: {data.timezone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weather Card */}
          {data.weather && (
            <Card className="shadow-lg hover:shadow-xl transition-all duration-200 bg-background border-gray-700">
              <CardHeader className="flex flex-row items-center space-x-4">
                <Cloud className="h-6 w-6 text-purple-400" />
                <CardTitle className="text-foreground">Weather</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5 text-red-400" />
                  <p className="text-xl font-semibold text-foreground">
                    {data.weather.temp}°C
                  </p>
                </div>
                <p className="text-gray-300">{data.weather.condition}</p>
                <p className="text-gray-300">
                  Humidity: {data.weather.humidity}%
                </p>
              </CardContent>
            </Card>
          )}

          {/* Map Card */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-200 bg-background border-gray-700">
            <CardHeader>
              <CardTitle className="text-foreground">Map Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-800/50 rounded-lg h-48 flex items-center justify-center">
                <img
                  src="/api/placeholder/400/200"
                  alt="Location Map"
                  className="rounded-lg w-full h-full object-cover"
                />
              </div>
              {data.latitude && data.longitude && (
                <p className="mt-2 text-sm text-gray-300 text-center">
                  Coordinates: {data.latitude}, {data.longitude}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-300 text-sm mt-12">
          <p>Data provided by Cloudflare</p>
        </footer>
      </div>
    </div>
  );
}
