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
  validation?: CertificateValidation;
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

export interface CertificateValidation {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
  securityScore: number;
}

// PKI.js extension interfaces
export interface SANExtension {
  type: number;
  value: string;
}

export interface SubjectAlternativeName {
  names: SANExtension[];
}

export interface KeyUsageExtension {
  digitalSignature?: boolean;
  nonRepudiation?: boolean;
  keyEncipherment?: boolean;
  dataEncipherment?: boolean;
  keyAgreement?: boolean;
  keyCertSign?: boolean;
  cRLSign?: boolean;
  encipherOnly?: boolean;
  decipherOnly?: boolean;
}

export interface ExtendedKeyUsageExtension {
  keyPurposes: string[];
}

export interface TypeAndValue {
  type: string;
  value: {
    valueBlock: {
      value: string;
    };
  };
}
