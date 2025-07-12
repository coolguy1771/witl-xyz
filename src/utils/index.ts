import { CONNECTION_TYPES, DEVICE_TYPES } from "../constants";
import type { VisitorData } from "../types";

/**
 * Formats a connection type string into a user-friendly display text
 */
export const formatConnectionType = (type: string | null): string | null => {
  if (!type) return null;
  return (
    CONNECTION_TYPES[type.toLowerCase() as keyof typeof CONNECTION_TYPES] ||
    type
  );
};

/**
 * Formats a device type string into a user-friendly display text
 */
export const formatDeviceType = (type: string | null): string => {
  if (!type) return DEVICE_TYPES.unknown;
  return (
    DEVICE_TYPES[type.toLowerCase() as keyof typeof DEVICE_TYPES] ||
    DEVICE_TYPES.unknown
  );
};

/**
 * Formats coordinates to a fixed number of decimal places
 */
export const formatCoordinates = (
  lat: string | null,
  lng: string | null
): string => {
  if (!lat || !lng) return "Unknown";
  return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
};

/**
 * Formats a date string using the provided timezone
 */
export const formatDate = (timezone: string | null): string => {
  if (!timezone) return "Unknown";
  return new Date().toLocaleDateString("en-US", {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Formats a time string using the provided timezone
 */
export const formatTime = (timezone: string | null): string => {
  if (!timezone) return "Unknown";
  return new Date().toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Checks if visitor data is complete
 */
export const isDataComplete = (data: Partial<VisitorData>): boolean => {
  return Boolean(
    data.ip &&
      data.city &&
      data.country &&
      data.timezone &&
      data.latitude &&
      data.longitude
  );
};

/**
 * Creates a Google Maps URL from coordinates
 */
export const createMapsUrl = (
  lat: string | null,
  lng: string | null
): string => {
  if (!lat || !lng) return "#";
  return `https://www.google.com/maps?q=${lat},${lng}`;
};

/**
 * Truncates a string to a specified length
 */
export const truncateString = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};

/**
 * Safely parses JSON with error handling
 */
export const safeJsonParse = <T>(str: string, fallback: T): T => {
  try {
    return JSON.parse(str) as T;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return fallback;
  }
};
