// API Constants
export const API_ENDPOINTS = {
  VISITOR: "/api/visitor",
} as const;

export const API_TIMEOUT = 5000; // 5 seconds

// Theme Constants
export const THEME = {
  BREAKPOINTS: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
  SPACING: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 32,
  },
} as const;

// Animation Constants
export const ANIMATIONS = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN_OUT: "cubic-bezier(0.4, 0, 0.2, 1)",
    EASE_OUT: "cubic-bezier(0.0, 0, 0.2, 1)",
    EASE_IN: "cubic-bezier(0.4, 0, 1, 1)",
  },
} as const;

// Connection Type Mapping
export const CONNECTION_TYPES = {
  broadband: "Broadband",
  cellular: "Cellular/Mobile",
  dialup: "Dial-up",
  corporate: "Corporate",
  fwa: "Fixed Wireless",
} as const;

// Device Type Mapping
export const DEVICE_TYPES = {
  mobile: "Mobile",
  tablet: "Tablet",
  desktop: "Desktop",
  unknown: "Unknown",
} as const;
