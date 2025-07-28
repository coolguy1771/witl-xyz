"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Tab,
  Tabs,
  useTheme,
  alpha,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import { SSLCertificate, SSLCertificateResponse } from "@/app/types/ssl";
import CertificateCard from "./CertificateCard";
import FileUpload from "../ui/FileUpload";
import { Search, Upload, Globe, ShieldCheck } from "lucide-react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ssl-tabpanel-${index}`}
      aria-labelledby={`ssl-tab-${index}`}
      {...other}
      style={{ paddingTop: "24px" }}
    >
      {value === index && children}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `ssl-tab-${index}`,
    "aria-controls": `ssl-tabpanel-${index}`,
  };
}

const SSLDashboard: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [domain, setDomain] = useState("");
  const [domainError, setDomainError] = useState("");
  const [certificate, setCertificate] = useState<SSLCertificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [apiNote, setApiNote] = useState<string | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Reset form state when switching tabs
    setCertificate(null);
    setDomainError("");
    setError("");
    setUploadSuccess(false);
    setUploadError("");
    setApiNote(null);
  };

  const validateDomain = (value: string) => {
    const domainRegex = /^(?!-)[A-Za-z0-9-]+(?<!-)(\.[A-Za-z0-9-]+)*(?<!-)\.[A-Za-z]{2,}$/;
    return domainRegex.test(value);
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
    setDomainError("");
  };

  const handleSearchCertificate = async () => {
    console.log("Starting certificate search for domain:", domain);

    // Validate domain
    if (!domain) {
      console.log("Validation error: Domain is required");
      setDomainError("Domain is required");
      return;
    }

    if (!validateDomain(domain)) {
      console.log("Validation error: Invalid domain format:", domain);
      setDomainError("Invalid domain format");
      return;
    }

    setIsLoading(true);
    setError("");
    setCertificate(null);
    setApiNote(null);

    console.log("Sending request to /api/ssl/fetch for domain:", domain);

    try {
      const startTime = performance.now();
      const response = await fetch("/api/ssl/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain }),
      });
      const endTime = performance.now();
      console.log(
        `API request completed in ${(endTime - startTime).toFixed(
          2
        )}ms with status: ${response.status}`
      );

      const data: SSLCertificateResponse = await response.json();
      console.log("API response data:", data);

      if (!response.ok || !data.success) {
        console.error("API error:", data.error || "Unknown API error");
        throw new Error(data.error || "Failed to fetch certificate information");
      }

      // Check if the API returned a note
      if (data.note) {
        console.log("API note:", data.note);
        setApiNote(data.note);
      }

      if (data.certificate) {
        console.log("Certificate data received:", {
          subject: data.certificate.subject,
          issuer: data.certificate.issuer,
          validFrom: data.certificate.validFrom,
          validTo: data.certificate.validTo,
          daysRemaining: data.certificate.daysRemaining,
        });
      } else {
        console.warn("API returned success but no certificate data");
      }

      setCertificate(data.certificate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Certificate fetch error:", errorMessage, err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.log("Certificate search completed");
    }
  };

  const handleFileSelected = async (file: File) => {
    console.log(
      "Starting certificate upload process for file:",
      file.name,
      "Size:",
      file.size,
      "Type:",
      file.type
    );

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess(false);
    setCertificate(null);
    setApiNote(null);

    const formData = new FormData();
    formData.append("certificate", file);

    console.log("Sending file to /api/ssl/upload");

    try {
      const startTime = performance.now();
      const response = await fetch("/api/ssl/upload", {
        method: "POST",
        body: formData,
      });
      const endTime = performance.now();
      console.log(
        `Upload request completed in ${(endTime - startTime).toFixed(
          2
        )}ms with status: ${response.status}`
      );

      const data: SSLCertificateResponse = await response.json();
      console.log("Upload API response data:", data);

      if (!response.ok || !data.success) {
        console.error("Upload API error:", data.error || "Unknown upload error");
        throw new Error(data.error || "Failed to process certificate");
      }

      // Check if the API returned a note
      if (data.note) {
        console.log("Upload API note:", data.note);
        setApiNote(data.note);
      }

      if (data.certificate) {
        console.log("Uploaded certificate data received:", {
          subject: data.certificate.subject,
          issuer: data.certificate.issuer,
          validFrom: data.certificate.validFrom,
          validTo: data.certificate.validTo,
          daysRemaining: data.certificate.daysRemaining,
        });
      } else {
        console.warn("Upload API returned success but no certificate data");
      }

      setCertificate(data.certificate);
      setUploadSuccess(true);
      console.log("Certificate upload successful");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Certificate upload error:", errorMessage, err);
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
      console.log("Certificate upload process completed");
    }
  };

  return (
    <Box
      component="section"
      sx={{
        paddingTop: "120px", // Fixed value to ensure content is below navbar
        minHeight: "100vh",
        pb: { xs: 8, md: 12 },
        px: { xs: 2, sm: 4 },
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Box mb={{ xs: 6, md: 8 }}>
          <Typography
            variant="h3"
            component={motion.h1}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
              fontWeight: 800,
              mb: 1,
              background: (theme) =>
                `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SSL Certificate Tools
          </Typography>
          <Typography
            variant="h6"
            component={motion.p}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            color="text.secondary"
            fontWeight="normal"
          >
            Check, analyze, and manage SSL certificates
          </Typography>

          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{
              mt: 2,
              p: 3,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              SSL certificates are crucial for website security, ensuring encrypted connections
              between websites and visitors. They verify website identity, protect data in transit,
              and build trust with users. Regularly monitoring certificate validity helps prevent
              security warnings and downtime.
            </Typography>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: `1px solid ${theme.palette.divider}`,
            mb: 4,
          }}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="SSL certificate tools tabs"
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              "& .MuiTabs-indicator": {
                height: 3,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
              },
              "& .MuiTab-root": {
                fontWeight: 600,
                py: 2,
                px: 3,
              },
            }}
          >
            <Tab
              icon={<Search size={18} />}
              label="Certificate Lookup"
              iconPosition="start"
              {...a11yProps(0)}
            />
            <Tab
              icon={<Upload size={18} />}
              label="Upload Certificate"
              iconPosition="start"
              {...a11yProps(1)}
            />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  <Globe size={20} style={{ verticalAlign: "text-bottom", marginRight: 8 }} />
                  Check SSL Certificate for a Domain
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Enter a domain name to retrieve its SSL certificate information, including
                  validity period, issuer details, and security parameters.
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    alignItems: { xs: "stretch", sm: "center" },
                  }}
                >
                  <TextField
                    label="Domain Name"
                    placeholder="e.g., example.com"
                    variant="outlined"
                    fullWidth
                    value={domain}
                    onChange={handleDomainChange}
                    error={!!domainError}
                    helperText={domainError}
                    sx={{ flex: 1 }}
                    disabled={isLoading}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={
                      isLoading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <Search size={20} />
                      )
                    }
                    onClick={handleSearchCertificate}
                    disabled={isLoading}
                    sx={{
                      height: { xs: 56, sm: 56 },
                      width: { xs: "100%", sm: "auto" },
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isLoading ? "Checking..." : "Check Certificate"}
                  </Button>
                </Box>
              </Box>

              {error && !certificate && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {apiNote && !error && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  {apiNote}
                </Alert>
              )}

              {isLoading && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <CircularProgress size={48} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Fetching certificate information...
                  </Typography>
                </Box>
              )}

              {(certificate || error) && (
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  sx={{ mt: 2 }}
                >
                  <CertificateCard certificate={certificate} error={error} />
                </Box>
              )}

              {!certificate && !isLoading && !error && (
                <Card
                  variant="outlined"
                  sx={{
                    textAlign: "center",
                    py: 6,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    border: `1px dashed ${theme.palette.divider}`,
                  }}
                >
                  <CardContent>
                    <ShieldCheck size={48} strokeWidth={1.5} color={theme.palette.text.secondary} />
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      Enter a domain to check its SSL certificate
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      We&apos;ll analyze the certificate and show you details like expiration date,
                      issuer, and security features.
                    </Typography>

                    <Box
                      sx={{
                        mt: 4,
                        textAlign: "left",
                        bgcolor: alpha(theme.palette.info.main, 0.05),
                        p: 2,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                        What is an SSL certificate?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        An SSL certificate is a digital certificate that authenticates a
                        website&apos;s identity and enables an encrypted connection (HTTPS). When
                        you access a website with a valid SSL certificate, your data is encrypted
                        between your browser and the server, protecting sensitive information like
                        passwords and credit card details.
                      </Typography>

                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                        Why check SSL certificates?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Monitor expiration dates to prevent security warnings
                        <br />
                        • Verify that domains are properly secured
                        <br />
                        • Ensure proper certificate configuration
                        <br />
                        • Check for trusted Certificate Authorities (CAs)
                        <br />• Confirm encryption strength and algorithms
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  <Upload size={20} style={{ verticalAlign: "text-bottom", marginRight: 8 }} />
                  Upload SSL Certificate
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Upload your PEM-encoded certificate (*.crt, *.pem) to analyze its properties and
                  security features.
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <FileUpload
                    onFileSelected={handleFileSelected}
                    accept=".pem,.crt,.cer,.cert"
                    label="Upload SSL Certificate"
                    isLoading={isUploading}
                    success={uploadSuccess}
                    errorMessage={uploadError}
                  />
                </Box>

                {uploadError && !certificate && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {uploadError}
                  </Alert>
                )}

                {apiNote && !uploadError && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    {apiNote}
                  </Alert>
                )}

                {isUploading && (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress size={48} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      Processing certificate...
                    </Typography>
                  </Box>
                )}

                {(certificate || uploadError) && !isUploading && (
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    sx={{ mt: 3 }}
                  >
                    <CertificateCard certificate={certificate} error={uploadError} />
                  </Box>
                )}

                {!certificate && !isUploading && !uploadError && (
                  <Card
                    variant="outlined"
                    sx={{
                      textAlign: "center",
                      py: 6,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      border: `1px dashed ${theme.palette.divider}`,
                    }}
                  >
                    <CardContent>
                      <Upload size={48} strokeWidth={1.5} color={theme.palette.text.secondary} />
                      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                        No certificate uploaded yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Upload a PEM-encoded certificate to analyze it
                      </Typography>

                      <Box
                        sx={{
                          mt: 4,
                          textAlign: "left",
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          p: 2,
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                          About Certificate Formats
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          This tool accepts SSL certificates in PEM format, which is the most common
                          format for certificates. PEM files are Base64 encoded and have headers and
                          footers that look like:
                        </Typography>

                        <Box
                          component="pre"
                          sx={{
                            mt: 1,
                            p: 1.5,
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            borderRadius: 1,
                            border: `1px solid ${theme.palette.divider}`,
                            fontSize: "0.75rem",
                            fontFamily: "monospace",
                            overflow: "auto",
                          }}
                        >
                          -----BEGIN CERTIFICATE-----
                          <br />
                          MIIDazCCAlOgAwIBAgIUGxYK...
                          <br />
                          ...(certificate data)...
                          <br />
                          -----END CERTIFICATE-----
                        </Box>

                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                          Common Certificate File Extensions
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • .pem - Privacy Enhanced Mail format
                          <br />
                          • .crt - Certificate file
                          <br />
                          • .cer - Another certificate file extension
                          <br />• .cert - Another certificate file extension
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Box>
            </TabPanel>
          </Box>
        </Paper>

        <Box
          mt={{ xs: 6, md: 8 }}
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.03),
            borderRadius: 2,
            p: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Understanding SSL Certificate Components
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                  Certificate Subject
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, flex: 1 }}>
                  The subject contains information about the certificate owner, including the Common
                  Name (CN) which should match the domain name. Other fields include Organization
                  (O), Organizational Unit (OU), Country (C), State/Province (ST), and Locality (L).
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                  Certificate Authority
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, flex: 1 }}>
                  The issuer information identifies the Certificate Authority (CA) that issued and
                  signed the certificate. Trusted CAs like Let&apos;s Encrypt, DigiCert, and Comodo
                  are pre-installed in browsers, allowing them to verify certificate authenticity.
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                  Validity Period
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, flex: 1 }}>
                  Every certificate has a limited lifespan defined by its validity dates. Modern
                  certificates typically last 1-2 years, with many now limited to 13 months maximum.
                  Expired certificates trigger security warnings in browsers.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              This is a demonstration of SSL certificate analysis capabilities
            </Typography>
            <Typography variant="caption" color="text.secondary" component="p">
              All certificate data is processed in your browser and is not stored permanently
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SSLDashboard;
