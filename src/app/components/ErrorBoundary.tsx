"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
  AlertTitle,
} from "@mui/material";
import { RefreshCw, Home, Bug } from "lucide-react";
import { ErrorLogger } from "../lib/error-handler";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console and external service
    ErrorLogger.log(error, {
      type: "REACT_ERROR_BOUNDARY",
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // In a real app, you'd send this to your error reporting service
    console.log("Error Report:", errorReport);

    // For now, copy to clipboard
    navigator.clipboard
      .writeText(JSON.stringify(errorReport, null, 2))
      .then(() => alert("Error report copied to clipboard"))
      .catch(() => alert("Failed to copy error report"));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Box sx={{ textAlign: "center" }}>
            <Alert
              severity="error"
              sx={{
                mb: 4,
                textAlign: "left",
                "& .MuiAlert-icon": {
                  fontSize: "2rem",
                },
              }}
            >
              <AlertTitle sx={{ fontSize: "1.25rem", mb: 1 }}>
                Something went wrong
              </AlertTitle>
              <Typography variant="body1" sx={{ mb: 2 }}>
                We encountered an unexpected error. This has been logged and our
                team will investigate the issue.
              </Typography>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    <strong>Error Details:</strong>
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      fontSize: "0.75rem",
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                      p: 2,
                      borderRadius: 1,
                      overflow: "auto",
                      maxHeight: "200px",
                    }}
                  >
                    {this.state.error.message}
                    {this.state.error.stack && (
                      <>
                        {"\n\n"}
                        {this.state.error.stack}
                      </>
                    )}
                  </Box>
                </Box>
              )}
            </Alert>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                startIcon={<RefreshCw size={18} />}
                onClick={this.handleRetry}
                sx={{ minWidth: 120 }}
              >
                Try Again
              </Button>

              <Button
                variant="outlined"
                startIcon={<Home size={18} />}
                onClick={this.handleGoHome}
                sx={{ minWidth: 120 }}
              >
                Go Home
              </Button>

              {process.env.NODE_ENV === "development" && (
                <Button
                  variant="text"
                  startIcon={<Bug size={18} />}
                  onClick={this.handleReportError}
                  sx={{ minWidth: 120 }}
                >
                  Report Error
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
