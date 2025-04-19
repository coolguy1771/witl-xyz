export interface SSLCertificate {
  subject: {
    CN: string;
    O?: string;
    OU?: string;
    C?: string;
    ST?: string;
    L?: string;
  };
  issuer: {
    CN: string;
    O?: string;
    OU?: string;
    C?: string;
    ST?: string;
    L?: string;
  };
  validFrom: string;
  validTo: string;
  fingerprint: string;
  serialNumber?: string;
  version?: number;
  signatureAlgorithm?: string;
  subjectAlternativeName?: string[];
  keyUsage?: string[];
  extendedKeyUsage?: string[];
  issuedAt?: string;
  expiresAt?: string;
  daysRemaining?: number;
}

export interface SSLCertificateResponse {
  certificate: SSLCertificate | null;
  error?: string;
  success: boolean;
  note?: string;
}

export interface SSLCertificateInfoRequest {
  domain: string;
}

export interface SSLCertificateUploadRequest {
  certificateContent: string;
  privateKeyContent?: string;
  passphrase?: string;
}
