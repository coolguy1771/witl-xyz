import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Full list of CF headers we can extract
// https://developers.cloudflare.com/fundamentals/get-started/reference/http-request-headers/

// Add caching for faster response times
export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    
    // Basic visitor information
    const visitorData = {
      // IP and location data
      ip: headersList.get('cf-connecting-ip') || null,
      city: headersList.get('cf-ipcity') || null,
      country: headersList.get('cf-ipcountry') || null,
      countryName: headersList.get('cf-ipcountry-name') || null,
      region: headersList.get('cf-region') || null,
      regionCode: headersList.get('cf-region-code') || null,
      continent: headersList.get('cf-ipcontinentcode') || null,
      postalCode: headersList.get('cf-postal-code') || null,
      latitude: headersList.get('cf-iplatitude') || null,
      longitude: headersList.get('cf-iplongitude') || null,
      timezone: headersList.get('cf-timezone') || null,
      
      // Network information
      asn: headersList.get('cf-ipasn') || null,
      asOrganization: headersList.get('cf-ipasnorg') || null,
      connectionType: headersList.get('cf-ipconntype') || null,
      
      // Device information
      deviceType: headersList.get('cf-device-type') || null,
      
      // Browser information 
      userAgent: request.headers.get('user-agent') || null,
      
      // Request information
      requestScheme: headersList.get('cf-visitor') 
        ? JSON.parse(headersList.get('cf-visitor') || '{}').scheme 
        : null,
      requestCountry: headersList.get('cf-ray')?.split('-')[1] || null,
      
      // Approximate geolocation accuracy
      accuracy: headersList.get('cf-ipgeo-accuracy') || null,
    };
    
    // Simplified boolean for easy checks
    const isDataComplete = Boolean(
      visitorData.ip && 
      visitorData.city && 
      visitorData.country
    );
    
    // Immediately return the core data without waiting for weather
    const responseData = {
      ...visitorData,
      isDataComplete,
      // Weather will be null at first
      weather: null as null | { temp: number; condition: string; humidity: number }
    };
    
    // Use setTimeout to avoid blocking the response for non-essential data
    if (visitorData.city) {
      // Mock weather data based on location (in a real app, you'd call a weather API)
      const mockWeatherData = {
        temp: Math.floor(Math.random() * 25) + 5, // 5-30°C
        condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 5)],
        humidity: Math.floor(Math.random() * 50) + 30, // 30-80%
      };
      
      // Add weather data to response
      responseData.weather = mockWeatherData;
    }
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error extracting visitor data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve visitor data', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}