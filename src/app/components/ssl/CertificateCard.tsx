"use client";

import React from "react";
import { format, formatDistance } from "date-fns";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
  useTheme,
  alpha,
  Grid,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import { SSLCertificate } from "@/app/types/ssl";
import {
  Shield,
  Clock,
  Calendar,
  Copy,
  CheckCircle,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Lock,
} from "lucide-react";

// Certificate field explanations for tooltips
const fieldExplanations = {
  commonName:
    "Common Name (CN) identifies the domain name secured by the certificate. This must match the website's domain or the browser will show security warnings.",
  organization:
    "Organization (O) field specifies the legal entity that owns the certificate, typically a company or organization name.",
  issuer:
    "The Certificate Authority (CA) that verified your identity and issued this certificate. Browsers trust certificates based on their issuer.",
  serialNumber:
    "A unique identifier assigned by the CA to this specific certificate. Used for tracking and revocation purposes.",
  signatureAlgorithm:
    "The cryptographic algorithm used to generate the digital signature. Stronger algorithms provide better security.",
  fingerprint:
    "A unique hash of the certificate data. Can be used to verify certificate authenticity and detect modifications.",
  subjectAltNames:
    "Additional domain names secured by this certificate. Modern certificates use this to cover multiple domains and subdomains.",
  keyUsage:
    "Specifies what the certificate's public key can be used for, such as digital signatures or encryption.",
  extendedKeyUsage:
    "Additional purposes for which the certificate can be used, such as server authentication or code signing.",
  validity:
    "The time period during which the certificate is considered valid and trusted by browsers.",
};

interface CertificateCardProps {
  certificate: SSLCertificate | null;
  showTitleBar?: boolean;
  error?: string;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  showTitleBar = true,
  error,
}) => {
  const theme = useTheme();
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  // Log component rendering state
  React.useEffect(() => {
    if (certificate) {
      console.log("CertificateCard rendering with certificate data:", {
        subject: certificate.subject,
        issuer: certificate.issuer,
        validFrom: certificate.validFrom,
        validTo: certificate.validTo,
        daysRemaining: certificate.daysRemaining,
      });
    } else {
      console.warn("CertificateCard rendering without certificate data");
      if (error) {
        console.error("Certificate error:", error);
      }
    }
  }, [certificate, error]);

  // If there's no certificate data, show error message
  if (!certificate) {
    return (
      <Card
        elevation={1}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            backgroundColor: alpha(theme.palette.error.main, 0.1),
            borderBottom: `1px solid ${theme.palette.divider}`,
            padding: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <XCircle size={24} color={theme.palette.error.main} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Certificate Not Available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unable to fetch or parse certificate information
              </Typography>
            </Box>
          </Box>
        </Box>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            }}
          >
            <AlertTriangle size={32} color={theme.palette.error.main} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" color={theme.palette.error.main}>
                Certificate Error
              </Typography>
              <Typography variant="body2">
                {error ||
                  "The SSL certificate could not be fetched or processed. This could be due to a network issue, an invalid certificate, or the server not responding."}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Format dates for display
  const validFrom = new Date(certificate.validFrom);
  const validTo = new Date(certificate.validTo);
  const daysRemaining = certificate.daysRemaining || 0;

  // Calculate progress percentage for certificate validity
  const totalValidityDays = Math.floor(
    (validTo.getTime() - validFrom.getTime()) / (1000 * 60 * 60 * 24)
  );
  const elapsed = totalValidityDays - daysRemaining;
  const validityPercentage = Math.max(0, Math.min(100, (elapsed / totalValidityDays) * 100));

  // Log certificate validity calculations
  console.log("Certificate validity calculations:", {
    validFrom: validFrom.toISOString(),
    validTo: validTo.toISOString(),
    totalValidityDays,
    daysRemaining,
    elapsed,
    validityPercentage,
  });

  // Determine certificate status color
  const getStatusColor = () => {
    if (daysRemaining <= 0) return theme.palette.error.main;
    if (daysRemaining <= 30) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const statusColor = getStatusColor();

  // Handle copying certificate values
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Format certificate data for display
  const formatFieldValue = (value: string | undefined) => {
    return value || "Not specified";
  };

  // Get certificate strength assessment
  const getCertificateStrength = () => {
    // Check if it's a wildcard certificate
    // const hasWildcard = certificate.subjectAlternativeName?.some((name) =>
    //   name.includes("*.")
    // );

    // Check algorithm strength
    const isStrongAlgorithm =
      certificate.signatureAlgorithm === "SHA256withRSA" ||
      certificate.signatureAlgorithm?.includes("SHA256") ||
      certificate.signatureAlgorithm?.includes("SHA384") ||
      certificate.signatureAlgorithm?.includes("SHA512");

    // Check CA trustworthiness
    const isTrustedCA =
      certificate.issuer.O === "Let's Encrypt" ||
      certificate.issuer.O?.includes("DigiCert") ||
      certificate.issuer.O?.includes("GeoTrust") ||
      certificate.issuer.O?.includes("GlobalSign") ||
      certificate.issuer.O?.includes("Comodo") ||
      certificate.issuer.O?.includes("Sectigo");

    // Calculate overall strength
    if (isStrongAlgorithm && isTrustedCA && daysRemaining > 30) {
      return {
        strength: "Strong",
        color: theme.palette.success.main,
        description:
          "This certificate uses modern encryption, is from a trusted issuer, and is not close to expiration.",
      };
    } else if (daysRemaining <= 0) {
      return {
        strength: "Expired",
        color: theme.palette.error.main,
        description: "This certificate has expired and is no longer considered valid by browsers.",
      };
    } else if (daysRemaining <= 30) {
      return {
        strength: "Expiring Soon",
        color: theme.palette.warning.main,
        description: "This certificate will expire soon and should be renewed.",
      };
    } else if (!isStrongAlgorithm) {
      return {
        strength: "Moderate",
        color: theme.palette.warning.main,
        description: "This certificate uses an older or less secure signature algorithm.",
      };
    } else {
      return {
        strength: "Good",
        color: theme.palette.info.main,
        description: "This certificate provides adequate security but could be improved.",
      };
    }
  };

  const strength = getCertificateStrength();

  // Field label with tooltip helper
  const FieldLabel = ({ label, tooltipText }: { label: string; tooltipText: string }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography variant="subtitle2" fontWeight="bold">
        {label}
      </Typography>
      <Tooltip
        title={
          <Typography variant="body2" sx={{ p: 1 }}>
            {tooltipText}
          </Typography>
        }
        arrow
        placement="top"
      >
        <Box sx={{ display: "inline-flex", cursor: "help" }}>
          <HelpCircle size={16} color={theme.palette.text.secondary} />
        </Box>
      </Tooltip>
    </Box>
  );

  return (
    <Card
      elevation={1}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {showTitleBar && (
        <Box
          sx={{
            backgroundColor: alpha(statusColor, 0.1),
            borderBottom: `1px solid ${theme.palette.divider}`,
            padding: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Shield size={24} color={statusColor} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {certificate.subject.CN}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Issued by {certificate.issuer.CN}
              </Typography>
            </Box>
          </Box>

          <Chip
            label={daysRemaining > 0 ? `${daysRemaining} days remaining` : "Expired"}
            color={daysRemaining <= 0 ? "error" : daysRemaining <= 30 ? "warning" : "success"}
            icon={daysRemaining > 0 ? <Clock size={16} /> : <XCircle size={16} />}
            sx={{ fontWeight: 500 }}
            variant="outlined"
          />
        </Box>
      )}

      <CardContent sx={{ p: 3 }}>
        {/* Certificate strength indicator */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(strength.color, 0.1),
            border: `1px solid ${alpha(strength.color, 0.2)}`,
          }}
        >
          <Lock size={32} color={strength.color} />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" color={strength.color}>
              {strength.strength} Security
            </Typography>
            <Typography variant="body2">{strength.description}</Typography>
          </Box>
        </Box>

        {/* Validity progress bar with tooltip explanation */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Tooltip
                title={
                  <Typography variant="body2" sx={{ p: 1 }}>
                    {fieldExplanations.validity}
                    <br />
                    <br />
                    Certificate validity starts on this date. Before this date, the certificate is
                    not considered valid.
                  </Typography>
                }
                arrow
                placement="top"
              >
                <Box sx={{ display: "flex", alignItems: "center", cursor: "help" }}>
                  <Calendar
                    size={16}
                    style={{ verticalAlign: "text-bottom", marginRight: "4px" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Valid from: {format(validFrom, "PPP")}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Tooltip
                title={
                  <Typography variant="body2" sx={{ p: 1 }}>
                    {fieldExplanations.validity}
                    <br />
                    <br />
                    Certificate expiration date. After this date, browsers will show security
                    warnings or block access.
                  </Typography>
                }
                arrow
                placement="top"
              >
                <Box sx={{ display: "flex", alignItems: "center", cursor: "help" }}>
                  <Calendar
                    size={16}
                    style={{ verticalAlign: "text-bottom", marginRight: "4px" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Expires on: {format(validTo, "PPP")}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={validityPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.divider, 0.5),
              "& .MuiLinearProgress-bar": {
                backgroundColor: statusColor,
                borderRadius: 4,
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <Chip
              size="small"
              label={`Certificate ${
                daysRemaining > 0
                  ? `valid for ${formatDistance(validTo, new Date(), {
                      addSuffix: false,
                    })}`
                  : "has expired"
              }`}
              sx={{
                fontSize: "0.75rem",
                bgcolor: alpha(statusColor, 0.1),
                color: statusColor,
                border: `1px solid ${alpha(statusColor, 0.3)}`,
              }}
              icon={daysRemaining > 0 ? <CheckCircle size={12} /> : <XCircle size={12} />}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Certificate details grid with tooltips */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="Common Name (CN)" tooltipText={fieldExplanations.commonName} />
            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
              <Typography variant="body2" fontFamily="monospace" sx={{ flex: 1 }}>
                {certificate.subject.CN}
              </Typography>
              <Tooltip title={copiedField === "cn" ? "Copied!" : "Copy to clipboard"}>
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(certificate.subject.CN, "cn")}
                  sx={{
                    color: copiedField === "cn" ? "success.main" : "action.active",
                  }}
                >
                  {copiedField === "cn" ? <CheckCircle size={16} /> : <Copy size={16} />}
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="Organization (O)" tooltipText={fieldExplanations.organization} />
            <Typography variant="body2" fontFamily="monospace">
              {formatFieldValue(certificate.subject.O)}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="Issuer" tooltipText={fieldExplanations.issuer} />
            <Typography variant="body2" fontFamily="monospace">
              {certificate.issuer.CN}
              {certificate.issuer.O && `, ${certificate.issuer.O}`}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="Serial Number" tooltipText={fieldExplanations.serialNumber} />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="body2"
                fontFamily="monospace"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flex: 1,
                }}
              >
                {certificate.serialNumber || "Not available"}
              </Typography>
              {certificate.serialNumber && (
                <Tooltip title={copiedField === "serial" ? "Copied!" : "Copy to clipboard"}>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(certificate.serialNumber || "", "serial")}
                    sx={{
                      color: copiedField === "serial" ? "success.main" : "action.active",
                    }}
                  >
                    {copiedField === "serial" ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel
              label="Signature Algorithm"
              tooltipText={fieldExplanations.signatureAlgorithm}
            />
            <Tooltip
              title={
                <Typography variant="body2" sx={{ p: 1 }}>
                  {certificate.signatureAlgorithm === "SHA256withRSA"
                    ? "SHA-256 with RSA encryption is a strong and widely trusted algorithm for digital signatures."
                    : "This algorithm is used to create a digital signature for the certificate."}
                </Typography>
              }
              arrow
              placement="top"
            >
              <Typography variant="body2" fontFamily="monospace" sx={{ cursor: "help" }}>
                {certificate.signatureAlgorithm || "Not available"}
              </Typography>
            </Tooltip>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel label="Fingerprint" tooltipText={fieldExplanations.fingerprint} />
            <Typography
              variant="body2"
              fontFamily="monospace"
              sx={{
                wordBreak: "break-all",
                fontSize: "0.75rem",
              }}
            >
              {certificate.fingerprint}
            </Typography>
          </Grid>

          {certificate.subjectAlternativeName && certificate.subjectAlternativeName.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <FieldLabel
                label="Subject Alternative Names"
                tooltipText={fieldExplanations.subjectAltNames}
              />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {certificate.subjectAlternativeName.map((san, index) => (
                  <Tooltip
                    key={index}
                    title={
                      <Typography variant="body2" sx={{ p: 1 }}>
                        This is an additional domain secured by this certificate. Modern browsers
                        check these names when validating certificates.
                      </Typography>
                    }
                    arrow
                  >
                    <Chip
                      label={san.replace("DNS:", "")}
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: 1,
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        cursor: "help",
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Grid>
          )}
        </Grid>

        {certificate.keyUsage && certificate.keyUsage.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <FieldLabel label="Key Usage" tooltipText={fieldExplanations.keyUsage} />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              {certificate.keyUsage.map((usage, index) => (
                <Tooltip
                  key={index}
                  title={
                    <Typography variant="body2" sx={{ p: 1 }}>
                      {usage === "Digital Signature"
                        ? "Allows the certificate to be used for authenticating documents or messages."
                        : usage === "Key Encipherment"
                          ? "Allows the certificate to be used for encrypting symmetric keys."
                          : `This usage restricts what the certificate can be used for.`}
                    </Typography>
                  }
                  arrow
                >
                  <Chip
                    label={usage}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.75rem", cursor: "help" }}
                  />
                </Tooltip>
              ))}
            </Box>
          </>
        )}

        {certificate.extendedKeyUsage && certificate.extendedKeyUsage.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <FieldLabel
              label="Extended Key Usage"
              tooltipText={fieldExplanations.extendedKeyUsage}
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              {certificate.extendedKeyUsage.map((usage, index) => (
                <Tooltip
                  key={index}
                  title={
                    <Typography variant="body2" sx={{ p: 1 }}>
                      {usage === "Server Authentication"
                        ? "This certificate can be used to identify web servers (websites)."
                        : usage === "Client Authentication"
                          ? "This certificate can be used to identify clients to servers."
                          : `Specifies a specific purpose for which this certificate can be used.`}
                    </Typography>
                  }
                  arrow
                >
                  <Chip
                    label={usage}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.75rem", cursor: "help" }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Security recommendations */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Security Recommendations
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Expiration monitoring */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(
                  daysRemaining <= 30 ? theme.palette.warning.main : theme.palette.success.main,
                  0.05
                ),
                border: `1px solid ${alpha(
                  daysRemaining <= 30 ? theme.palette.warning.main : theme.palette.success.main,
                  0.2
                )}`,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                Certificate Expiration
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {daysRemaining <= 0
                  ? "Your certificate has expired. You need to renew it immediately to restore secure connections."
                  : daysRemaining <= 30
                    ? `Your certificate will expire in ${daysRemaining} days. Begin the renewal process now to ensure uninterrupted service.`
                    : `Your certificate is valid for another ${daysRemaining} days. Set a reminder to renew it before expiration.`}
              </Typography>
            </Box>

            {/* Certificate Authority */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                Certificate Authority
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                This certificate was issued by {certificate.issuer.CN}
                {certificate.issuer.O ? ` (${certificate.issuer.O})` : ""}.
                {certificate.issuer.O === "Let's Encrypt"
                  ? " Let's Encrypt certificates are trusted by most browsers and devices, but have a short validity period (90 days) and require automated renewal."
                  : " Commercial CAs typically provide longer validity periods but require payment for each certificate."}
              </Typography>
            </Box>

            {/* Subject alternative names */}
            {certificate.subjectAlternativeName &&
              certificate.subjectAlternativeName.length > 0 && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Domain Coverage
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    This certificate covers {certificate.subjectAlternativeName.length} domain
                    {certificate.subjectAlternativeName.length !== 1 ? "s" : ""}.
                    {certificate.subjectAlternativeName.length === 1
                      ? " Consider using a certificate that also covers the 'www' subdomain if applicable."
                      : " Multi-domain certificates provide good flexibility, but ensure all critical subdomains are included."}
                  </Typography>
                </Box>
              )}

            {/* Algorithm strength */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(
                  certificate.signatureAlgorithm === "SHA256withRSA" ||
                    certificate.signatureAlgorithm?.includes("SHA256") ||
                    certificate.signatureAlgorithm?.includes("SHA384") ||
                    certificate.signatureAlgorithm?.includes("SHA512")
                    ? theme.palette.success.main
                    : theme.palette.warning.main,
                  0.05
                ),
                border: `1px solid ${alpha(
                  certificate.signatureAlgorithm === "SHA256withRSA" ||
                    certificate.signatureAlgorithm?.includes("SHA256") ||
                    certificate.signatureAlgorithm?.includes("SHA384") ||
                    certificate.signatureAlgorithm?.includes("SHA512")
                    ? theme.palette.success.main
                    : theme.palette.warning.main,
                  0.2
                )}`,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                Encryption Strength
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {certificate.signatureAlgorithm === "SHA256withRSA" ||
                certificate.signatureAlgorithm?.includes("SHA256") ||
                certificate.signatureAlgorithm?.includes("SHA384") ||
                certificate.signatureAlgorithm?.includes("SHA512")
                  ? "This certificate uses a strong, modern signature algorithm that provides good security."
                  : "This certificate uses an older or less secure signature algorithm. Consider upgrading to a certificate with SHA-256 or better."}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CertificateCard;
