"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import { 
  Card, 
  CardHeader, 
  CardContent,
  Typography,
  Container,
  Box,
  CircularProgress,
  Chip,
  useTheme,
  Skeleton,
  Button,
  alpha,
  Alert,
  Tooltip,
  Divider
} from "@mui/material";
import { Grid2 } from "@mui/material"; // Using stable Grid2 from MUI
// Import only the icons we need for the loading state
import { RefreshCw } from "lucide-react";

// Lazy load all other icons to reduce initial bundle size
const Globe = lazy(() => import("lucide-react").then(mod => ({ default: mod.Globe })));
const Cloud = lazy(() => import("lucide-react").then(mod => ({ default: mod.Cloud })));
const Thermometer = lazy(() => import("lucide-react").then(mod => ({ default: mod.Thermometer })));
const MapPin = lazy(() => import("lucide-react").then(mod => ({ default: mod.MapPin })));
const Network = lazy(() => import("lucide-react").then(mod => ({ default: mod.Network })));
const AlertTriangle = lazy(() => import("lucide-react").then(mod => ({ default: mod.AlertTriangle })));
const Laptop = lazy(() => import("lucide-react").then(mod => ({ default: mod.Laptop })));
const Smartphone = lazy(() => import("lucide-react").then(mod => ({ default: mod.Smartphone })));
const Database = lazy(() => import("lucide-react").then(mod => ({ default: mod.Database })));
const Clock = lazy(() => import("lucide-react").then(mod => ({ default: mod.Clock })));

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
}

interface EnhancedVisitorData {
  // IP and location data
  ip: string | null;
  city: string | null;
  country: string | null;
  countryName: string | null;
  region: string | null;
  regionCode: string | null;
  continent: string | null;
  postalCode: string | null;
  latitude: string | null;
  longitude: string | null;
  timezone: string | null;
  
  // Network information
  asn: string | null;
  asOrganization: string | null;
  connectionType: string | null;
  
  // Device information
  deviceType: string | null;
  userAgent: string | null;
  
  // Request information
  requestScheme: string | null;
  requestCountry: string | null;
  
  // Accuracy and status
  accuracy: string | null;
  isDataComplete?: boolean;
  
  // Weather data
  weather?: WeatherData | null;
}

interface Props {
  initialData: Partial<EnhancedVisitorData>;
}

/**
 * Reusable InfoCard component with dynamic styling
 * 
 * Creates consistent cards for displaying visitor information with:
 * - Interactive hover effects with smooth transitions
 * - Colored top border indicator for active data
 * - Consistent header styling with icon
 * - Responsive layout that maintains height within a grid
 * 
 * @param {React.ReactNode} icon - Icon component to display in the card header
 * @param {string} title - Title text for the card header
 * @param {React.ReactNode} children - Content to render in the card body
 * @param {boolean} noData - Whether the card represents a state with no data (changes styling)
 * @returns {JSX.Element} Styled card component
 */
function InfoCard({ 
  icon, 
  title, 
  children, 
  noData = false
}: { 
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  noData?: boolean;
}) {
  const theme = useTheme();

  return (
    <Card
      elevation={2}
      sx={theme => ({
        // Base styling for card appearance
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        
        // Animation transitions for hover effects
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.standard,
        }),
        
        // Layout properties
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        
        // Interactive hover state
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        },
        
        // Conditional top border indicator - only shows when data is present
        '&::before': noData ? {} : {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '3px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }
      })}
    >
      {/* Card header with icon and title */}
      <CardHeader
        avatar={
          <Box sx={theme => ({
            // Circular container for the icon
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            // Different background color based on data state
            backgroundColor: noData 
              ? alpha(theme.palette.warning.main, 0.1) // Warning background for no data
              : alpha(theme.palette.primary.main, 0.1), // Normal background for data
            color: noData ? theme.palette.warning.main : theme.palette.primary.main
          })}>
            {/* Lazy-loaded icon with fallback */}
            <Suspense fallback={<Box sx={{ width: 24, height: 24 }}></Box>}>
              {icon}
            </Suspense>
          </Box>
        }
        title={
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary
            }}
          >
            {title}
          </Typography>
        }
        sx={{
          pb: 1, // Reduce padding at bottom
          '& .MuiCardHeader-avatar': {
            marginRight: 2 // Spacing between icon and title
          }
        }}
      />
      
      {/* Card content area */}
      <CardContent sx={{ pt: 0 }}> {/* Remove padding at top to connect with header */}
        {noData ? (
          // Special warning display for when no data is available
          <Alert 
            severity="warning" 
            variant="outlined"
            icon={<AlertTriangle size={24} />}
            sx={{
              backgroundColor: alpha(theme.palette.warning.main, 0.05),
            }}
          >
            {children}
          </Alert>
        ) : children}
      </CardContent>
    </Card>
  );
}

/**
 * Empty state card component
 * 
 * Displays a consistent empty state when specific visitor data is unavailable.
 * Uses the InfoCard component with styling modifications to indicate missing data.
 * 
 * @param {React.ReactNode} icon - Icon to display in the empty state card
 * @param {string} title - Title of the empty state card
 * @param {string} message - Message explaining why data is unavailable
 * @returns {JSX.Element} Styled empty state card
 */
function EmptyStateCard({ 
  icon, 
  title, 
  message 
}: { 
  icon: React.ReactNode;
  title: string;
  message: string;
}) {
  return (
    <InfoCard 
      icon={
        <Suspense fallback={<Box sx={{ width: 24, height: 24 }}></Box>}>
          {icon}
        </Suspense>
      } 
      title={title} 
      noData
    >
      <Typography variant="body2">
        {message}
      </Typography>
    </InfoCard>
  );
}

/**
 * Loading state component for VisitorDashboard
 * 
 * Displays a visually appealing loading indicator with explanatory text while
 * the dashboard data is being fetched. Includes:
 * - Centered progress spinner
 * - Clear loading status message
 * - Explanation of data collection purpose
 * - Skeleton card placeholders with pulsing animation
 * 
 * @returns {JSX.Element} Loading state UI
 */
function LoadingState() {
  const theme = useTheme();

  return (
    <Box 
      component="section"
      sx={{ 
        paddingTop: '120px', // Fixed value to ensure content is below navbar
        minHeight: '100vh',
        pb: { xs: 8, md: 12 },
        px: { xs: 2, sm: 4 },
        backgroundColor: theme.palette.background.default
      }}
    >
      <Container maxWidth="lg">
        <Box 
          textAlign="center" 
          mb={{ xs: 6, md: 8 }}
          sx={{
            animation: 'fadeIn 0.5s ease-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0 },
              '100%': { opacity: 1 }
            }
          }}
        >
          <CircularProgress 
            size={40} 
            sx={{ mb: 3 }} 
          />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              mb: 2
            }}
          >
            Analyzing Your Connection
          </Typography>
          <Typography 
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            We're gathering information about your location, device, and connection.
            This data is not stored and is only used for this demonstration.
          </Typography>
        </Box>

        <Grid2 container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid2 size={{xs: 12, md: 6, lg: 4}} key={i}>
              <Card
                elevation={1}
                sx={theme => ({
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%',
                  borderRadius: 2
                })}
              >
                <CardHeader
                  avatar={
                    <Skeleton variant="circular" width={40} height={40} />
                  }
                  title={<Skeleton width="60%" />}
                />
                <CardContent>
                  <Skeleton variant="text" width="80%" height={30} />
                  <Skeleton variant="text" width="50%" height={20} sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="70%" height={20} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Container>
    </Box>
  );
}

/**
 * VisitorDashboard Component
 * 
 * A comprehensive dashboard that displays information about the current visitor,
 * including location, device, network, and weather data. The component:
 * 
 * 1. Renders with initial server-side data for fast loading
 * 2. Progressively enhances with additional client-side data
 * 3. Provides fallback states for missing data
 * 4. Includes a refresh mechanism to update data
 * 
 * Data is fetched using the browser's requestIdleCallback API to prioritize
 * UI responsiveness over data completeness.
 * 
 * @param {Props} props - Component props containing initial visitor data
 * @returns {JSX.Element} The dashboard UI
 */
export default function VisitorDashboard({ initialData }: Props) {
  // State Management
  // ----------------
  
  // Initialize with server-provided data and extend client-side
  const [data, setData] = useState<EnhancedVisitorData>({
    ...initialData as EnhancedVisitorData,
    weather: null // Weather data is only fetched client-side
  });
  
  // UI state tracking
  const [loading, setLoading] = useState(false); // False initially as we already have basic data
  const [initialLoaded, setInitialLoaded] = useState(false); // Tracks if enhanced data has been loaded
  const [error, setError] = useState<string | null>(null); // For error messaging
  const theme = useTheme();

  /**
   * Fetches enhanced visitor data from the API
   * 
   * This function handles loading states, error handling, and timeouts.
   * It's called both on initial load and when the user manually refreshes.
   * 
   * @param {boolean} isRefresh - Whether this is a manual refresh by the user
   */
  const fetchVisitorData = async (isRefresh = false) => {
    // Only fetch if we haven't loaded enhanced data yet or if user is refreshing
    if (!initialLoaded || isRefresh) {
      setLoading(true);
      setError(null);
      
      try {
        // Use AbortController to implement request timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        // Add cache control for faster responses
        const response = await fetch('/api/visitor', {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'x-requested-with': 'fetch'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const visitorData = await response.json();
        setData(prev => ({...prev, ...visitorData}));
        setInitialLoaded(true);
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          console.log('Request timed out - using initial data');
        } else {
          console.error('Error fetching visitor data:', err);
          setError('Failed to load complete visitor data. Some information may be missing.');
        }
        // Keep initial data if fetch fails
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Deferred data fetching using browser idle time
   * 
   * This effect uses requestIdleCallback to fetch enhanced visitor data
   * only when the browser is idle, ensuring that initial rendering and
   * interactivity are prioritized over complete data loading.
   * 
   * The approach provides a progressive enhancement where:
   * 1. Basic server-side data is displayed immediately
   * 2. Enhanced client-side data is loaded when the browser has capacity
   * 3. Fallback to a short timeout for browsers without requestIdleCallback
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Short initial delay to prioritize rendering
      setTimeout(() => {
        if ('requestIdleCallback' in window) {
          // Use browser's idle time to fetch non-critical data
          (window as any).requestIdleCallback(() => fetchVisitorData());
        } else {
          // Fallback for browsers that don't support requestIdleCallback
          setTimeout(() => fetchVisitorData(), 200);
        }
      }, 100);
    }
  }, []);

  if (loading) return <LoadingState />;

  /**
   * Formats raw connection type values into user-friendly display text
   * 
   * @param {string | null} type - Raw connection type value from the API
   * @returns {string | null} Formatted connection type string for display, or null if no type provided
   * 
   * Maps technical connection values to more readable terms and handles
   * edge cases like null values and unknown connection types.
   */
  const formatConnectionType = (type: string | null) => {
    if (!type) return null;
    
    // Map of connection types to user-friendly display values
    const connectionMap: Record<string, string> = {
      'broadband': 'Broadband',
      'cellular': 'Cellular/Mobile',
      'dialup': 'Dial-up',
      'corporate': 'Corporate',
      'fwa': 'Fixed Wireless'
    };
    
    // Return mapped value if it exists, otherwise return the original type
    return connectionMap[type.toLowerCase()] || type;
  };

  /**
   * Determines the appropriate icon to display based on device type
   * 
   * @param {string | null} type - Device type identifier from API
   * @returns {JSX.Element} React component for the appropriate device icon
   * 
   * Maps different device categories to their visual representations.
   * Default to laptop icon for unknown or null device types.
   */
  const getDeviceIcon = (type: string | null) => {
    if (!type) return <Laptop size={20} />;
    
    // Return different icons based on device category
    switch(type.toLowerCase()) {
      case 'mobile':
        return <Smartphone size={20} />; // Mobile phone icon
      default:
        return <Laptop size={20} />; // Default to laptop for unknown devices
    }
  };

  return (
    <Box 
      component="section"
      sx={{ 
        paddingTop: '120px', // Fixed value to ensure content is below navbar
        minHeight: '100vh',
        pb: { xs: 8, md: 12 },
        px: { xs: 2, sm: 4 },
        backgroundColor: theme.palette.background.default
      }}
    >
      <Container maxWidth="lg">
        <Box mb={{ xs: 6, md: 8 }}>
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: 2
            }}
          >
            <Box>
              <Typography 
                variant="h3"
                sx={{ 
                  fontWeight: 800,
                  mb: 1,
                  background: theme => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Your Digital Profile
              </Typography>
              <Typography 
                variant="h6"
                color="text.secondary"
                fontWeight="normal"
              >
                Analyzing your connection data in real-time
              </Typography>
            </Box>

            <Button 
              startIcon={<RefreshCw size={16} />}
              variant="outlined"
              color="primary"
              onClick={() => fetchVisitorData(true)}
              disabled={loading}
              sx={{ mt: { xs: 2, sm: 0 } }}
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </Box>

          {error && (
            <Alert 
              severity="warning" 
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>
          )}

          <Box 
            sx={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              mt: 2
            }}
          >
            {data.connectionType && (
              <Chip 
                icon={<Network size={16} />} 
                label={formatConnectionType(data.connectionType)} 
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {data.deviceType && (
              <Chip 
                icon={getDeviceIcon(data.deviceType)} 
                label={data.deviceType} 
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {data.requestScheme && (
              <Chip 
                label={data.requestScheme.toUpperCase()} 
                color={data.requestScheme === 'https' ? 'success' : 'error'}
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Box>

        <Grid2 
          container 
          spacing={3} 
          sx={{
            '& > .MuiGrid2-root': {
              opacity: 0,
              animation: 'fadeInUp 0.5s ease-out forwards',
              '@keyframes fadeInUp': {
                '0%': { 
                  opacity: 0,
                  transform: 'translateY(10px)' 
                },
                '100%': { 
                  opacity: 1,
                  transform: 'translateY(0)' 
                }
              }
            },
            // Apply different animation delays to each grid item
            '& > .MuiGrid2-root:nth-of-type(1)': { animationDelay: '0.05s' },
            '& > .MuiGrid2-root:nth-of-type(2)': { animationDelay: '0.10s' },
            '& > .MuiGrid2-root:nth-of-type(3)': { animationDelay: '0.15s' },
            '& > .MuiGrid2-root:nth-of-type(4)': { animationDelay: '0.20s' },
            '& > .MuiGrid2-root:nth-of-type(5)': { animationDelay: '0.25s' },
            '& > .MuiGrid2-root:nth-of-type(6)': { animationDelay: '0.30s' }
          }}
        >
          {/* IP Address Card */}
          {data.ip ? (
            <Grid2 size={{xs: 12, md: 6, lg: 4}}>
              <InfoCard 
                title="IP Address"
                icon={<Globe size={24} />}
              >
                <Box>
                  <Typography 
                    variant="h5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    sx={{ mb: 2 }}
                  >
                    {data.ip}
                  </Typography>
                  
                  {data.asOrganization && (
                    <Typography 
                      variant="body2"
                      color="text.secondary"
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1 
                      }}
                    >
                      <Database size={16} />
                      {data.asOrganization}
                      {data.asn && (
                        <Tooltip title="Autonomous System Number">
                          <Chip 
                            label={`ASN ${data.asn}`}
                            size="small"
                            sx={{ 
                              height: 20, 
                              fontSize: '0.7rem',
                              backgroundColor: alpha(theme.palette.primary.main, 0.1)
                            }}
                          />
                        </Tooltip>
                      )}
                    </Typography>
                  )}
                </Box>
              </InfoCard>
            </Grid2>
          ) : (
            <Grid2 size={{xs: 12, md: 6, lg: 4}}>
              <EmptyStateCard 
                icon={<Globe size={24} />}
                title="IP Address"
                message="Unable to detect your IP address"
              />
            </Grid2>
          )}

          {/* Location Card */}
          {data.city && data.country ? (
            <Grid2 size={{xs: 12, md: 6, lg: 4}}>
              <InfoCard 
                title="Your Location"
                icon={<MapPin size={24} />}
              >
                <Box>
                  <Typography 
                    variant="h5"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                  >
                    {data.city}, {data.countryName || data.country}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {data.region && (
                      <Typography 
                        variant="body2"
                        color="text.secondary"
                      >
                        Region: {data.region} {data.regionCode ? `(${data.regionCode})` : ''}
                      </Typography>
                    )}
                    
                    {data.postalCode && (
                      <Typography 
                        variant="body2"
                        color="text.secondary"
                      >
                        Postal Code: {data.postalCode}
                      </Typography>
                    )}
                    
                    {data.continent && (
                      <Typography 
                        variant="body2"
                        color="text.secondary"
                      >
                        Continent: {data.continent}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </InfoCard>
            </Grid2>
          ) : (
            <Grid2 size={{xs: 12, md: 6, lg: 4}}>
              <EmptyStateCard 
                icon={<MapPin size={24} />}
                title="Your Location"
                message="Location information unavailable"
              />
            </Grid2>
          )}

          {/* Timezone Card */}
          {data.timezone ? (
            <Grid2 size={{xs: 12, md: 6, lg: 4}}>
              <InfoCard 
                title="Time Information"
                icon={<Clock size={24} />}
              >
                <Box>
                  <Typography 
                    variant="h5"
                    fontWeight="bold"
                    sx={{ mb: 2 }}
                  >
                    {new Date().toLocaleTimeString('en-US', { 
                      timeZone: data.timezone,
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography 
                      variant="body2"
                      color="text.secondary"
                    >
                      Timezone: {data.timezone.replace('_', ' ')}
                    </Typography>
                    
                    <Typography 
                      variant="body2"
                      color="text.secondary"
                    >
                      Date: {new Date().toLocaleDateString('en-US', { 
                        timeZone: data.timezone,
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Box>
              </InfoCard>
            </Grid2>
          ) : (
            <Grid2 size={{xs: 12, md: 6, lg: 4}}>
              <EmptyStateCard 
                icon={<Clock size={24} />}
                title="Time Information"
                message="Timezone information unavailable"
              />
            </Grid2>
          )}

          {/* Weather Card */}
          {data.weather ? (
            <Grid2 size={{xs: 12, md: 6, lg: 4}}>
              <InfoCard 
                title="Local Weather"
                icon={<Cloud size={24} />}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold">
                      {data.weather.temp}°C
                    </Typography>
                    <Typography 
                      variant="subtitle1"
                      color="text.secondary"
                    >
                      {data.weather.condition}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Thermometer size={16} />
                    <Typography 
                      variant="body2"
                      color="text.secondary"
                    >
                      Humidity: {data.weather.humidity}%
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography 
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', fontStyle: 'italic' }}
                  >
                    Weather data based on your detected location
                  </Typography>
                </Box>
              </InfoCard>
            </Grid2>
          ) : (
            <Grid2 size={{xs: 12, md: 6, lg: 4}}>
              <EmptyStateCard 
                icon={<Cloud size={24} />}
                title="Local Weather"
                message="Weather information unavailable for your location"
              />
            </Grid2>
          )}

          {/* Browser/Device Card */}
          {data.userAgent ? (
            <Grid2 size={{xs: 12, md: 6, lg: 4}}>
              <InfoCard 
                title="Browser & Device"
                icon={getDeviceIcon(data.deviceType)}
              >
                <Box>
                  <Typography 
                    variant="body2"
                    sx={{ mb: 1 }}
                  >
                    {data.userAgent.split(' ').slice(-3).join(' ')}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {data.deviceType && (
                      <Typography 
                        variant="body2"
                        color="text.secondary"
                      >
                        Device Type: {data.deviceType}
                      </Typography>
                    )}
                    
                    {data.connectionType && (
                      <Typography 
                        variant="body2"
                        color="text.secondary"
                      >
                        Connection: {formatConnectionType(data.connectionType)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </InfoCard>
            </Grid2>
          ) : (
            <Grid2 size={{xs: 12, md: 6, lg: 4}}>
              <EmptyStateCard 
                icon={<Laptop size={24} />}
                title="Browser & Device"
                message="Device information unavailable"
              />
            </Grid2>
          )}

          {/* Map Location Card */}
          {data.latitude && data.longitude ? (
            <Grid2 size={{xs: 12, md: 6, lg: 4}}>
              <InfoCard 
                title="Map Coordinates"
                icon={<MapPin size={24} />}
              >
                <Box>
                  <Box 
                    sx={theme => ({ 
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.background.default, 0.5)
                        : alpha(theme.palette.primary.light, 0.05),
                      borderRadius: 2,
                      height: 120,
                      mb: 2,
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: `1px solid ${theme.palette.divider}`
                    })}
                  >
                    <Box 
                      sx={{ 
                        position: 'relative',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <MapPin size={32} color={theme.palette.primary.main} />
                      <Typography variant="body2">
                        {parseFloat(data.latitude).toFixed(4)}, {parseFloat(data.longitude).toFixed(4)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Typography 
                      variant="body2"
                      color="text.secondary"
                    >
                      {data.accuracy ? `Accuracy: ~${data.accuracy} km` : 'Approximate location'}
                    </Typography>
                    
                    <Button 
                      variant="text" 
                      size="small"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
                    >
                      View Map
                    </Button>
                  </Box>
                </Box>
              </InfoCard>
            </Grid2>
          ) : (
            <Grid2 size={{xs: 12, md: 6, lg: 4}}>
              <EmptyStateCard 
                icon={<MapPin size={24} />}
                title="Map Coordinates"
                message="Coordinate information unavailable"
              />
            </Grid2>
          )}
        </Grid2>

        <Box 
          textAlign="center" 
          mt={{ xs: 6, md: 8 }}
          sx={{ 
            backgroundColor: alpha(theme.palette.primary.main, 0.03),
            borderRadius: 2,
            p: 3,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography 
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            This information is derived from Cloudflare's HTTP request headers
          </Typography>
          <Typography 
            variant="caption"
            color="text.secondary"
            component="p"
          >
            All data is processed in your browser and is not stored or tracked
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}