"use client";

import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  alpha,
} from "@mui/material";
import { Upload, AlertCircle, FileText, CheckCircle } from "lucide-react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  label?: string;
  maxSize?: number; // in bytes
  variant?: "outlined" | "contained";
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  disabled?: boolean;
  isLoading?: boolean;
  success?: boolean;
  errorMessage?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,
  accept = "*/*",
  label = "Upload File",
  maxSize = 5 * 1024 * 1024, // 5MB default
  variant = "outlined",
  color = "primary",
  disabled = false,
  isLoading = false,
  success = false,
  errorMessage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setError(`File size exceeds maximum limit of ${maxSizeMB} MB`);
      return;
    }

    setSelectedFileName(file.name);
    setError(null);
    onFileSelected(file);
  };

  // Use error message from props if provided, otherwise use local error state
  const displayError = errorMessage || error;

  return (
    <Box sx={{ width: "100%" }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        style={{ display: "none" }}
        disabled={disabled || isLoading}
      />

      <Box
        sx={theme => ({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 3,
          borderRadius: 2,
          border: `1px dashed ${
            displayError ? theme.palette.error.main : theme.palette.divider
          }`,
          backgroundColor: displayError
            ? alpha(theme.palette.error.main, 0.04)
            : success
              ? alpha(theme.palette.success.main, 0.04)
              : alpha(theme.palette.primary.main, 0.02),
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: displayError
              ? alpha(theme.palette.error.main, 0.05)
              : success
                ? alpha(theme.palette.success.main, 0.05)
                : alpha(theme.palette.primary.main, 0.05),
            cursor: disabled || isLoading ? "not-allowed" : "pointer",
          },
        })}
        onClick={!disabled && !isLoading ? handleButtonClick : undefined}
      >
        {isLoading ? (
          <CircularProgress size={32} sx={{ mb: 1 }} />
        ) : success ? (
          <CheckCircle size={32} color="green" />
        ) : displayError ? (
          <AlertCircle size={32} color="red" />
        ) : (
          <Upload size={32} />
        )}

        <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }}>
          {isLoading ? "Uploading..." : success ? "Upload Successful" : label}
        </Typography>

        {selectedFileName && !displayError && !isLoading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mt: 1,
              gap: 1,
              color: "text.secondary",
            }}
          >
            <FileText size={16} />
            <Typography variant="body2" fontFamily="monospace">
              {selectedFileName}
            </Typography>
          </Box>
        )}

        {displayError && (
          <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
            {displayError}
          </Typography>
        )}

        {!selectedFileName && !isLoading && !displayError && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Click or drag file to upload
          </Typography>
        )}
      </Box>

      {!isLoading && !displayError && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant={variant}
            color={color}
            onClick={handleButtonClick}
            disabled={disabled || isLoading}
            startIcon={<Upload size={16} />}
            sx={{ borderRadius: 2 }}
          >
            {selectedFileName ? "Change File" : "Select File"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
