// Theme Types
export interface ThemeConfig {
  mode: "light" | "dark";
  primary: string;
  secondary: string;
}

// Weather Types
export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
}

// Visitor Data Types
export interface VisitorData {
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
  asn: string | null;
  asOrganization: string | null;
  connectionType: string | null;
  deviceType: string | null;
  userAgent: string | null;
  requestScheme: string | null;
  requestCountry: string | null;
  accuracy: string | null;
  isDataComplete?: boolean;
  weather?: WeatherData | null;
}

// Component Props Types
export interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  noData?: boolean;
}

export interface EmptyStateCardProps {
  icon: React.ReactNode;
  title: string;
  message: string;
}

export interface VisitorDashboardProps {
  initialData: Partial<VisitorData>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

// Animation Types
export interface AnimationVariants {
  initial: object;
  animate: object;
  exit: object;
}
