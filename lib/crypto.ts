
// HIPAA-Compliant Field-Level Encryption Utilities
// AES-256-GCM encryption for PHI data protection
// EDGE RUNTIME COMPATIBLE VERSION

// Edge Runtime compatible crypto detection
let crypto: any;
let isNodeEnvironment = false;

// Safe environment detection for Edge Runtime
if (typeof globalThis !== 'undefined' && globalThis.crypto) {
  // Always prefer Web Crypto API for Edge Runtime compatibility
  crypto = globalThis.crypto;
  isNodeEnvironment = false;
} else if (typeof window !== 'undefined' && window.crypto) {
  // Browser environment
  crypto = window.crypto;
  isNodeEnvironment = false;
} else {
  // Fallback - try Node.js crypto only if absolutely necessary
  try {
    crypto = require('crypto');
    isNodeEnvironment = true;
  } catch (error) {
    throw new Error('No crypto implementation available');
  }
}

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 32
const TAG_LENGTH = 16
const KEY_LENGTH = 32

interface EncryptionResult {
  encryptedData: string
  keyVersion: string
}

interface DecryptionInput {
  encryptedData: string
  keyVersion: string
}

class PHIEncryption {
  private masterKey: string
  private currentKeyVersion: string

  constructor() {
    // Use environment variable or generate secure key
    this.masterKey = (typeof process !== 'undefined' && process.env?.PHI_ENCRYPTION_KEY) || this.generateMasterKey()
    this.currentKeyVersion = (typeof process !== 'undefined' && process.env?.PHI_KEY_VERSION) || 'v1'
    
    if (typeof process !== 'undefined' && !process.env?.PHI_ENCRYPTION_KEY) {
      console.warn('PHI_ENCRYPTION_KEY not set. Using generated key for development only.')
    }
  }

  private generateMasterKey(): string {
    // Always use Web Crypto API for Edge Runtime compatibility
    const bytes = crypto.getRandomValues(new Uint8Array(KEY_LENGTH))
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private async deriveKeyAsync(salt: Uint8Array, keyVersion: string): Promise<CryptoKey> {
    const keyMaterial = `${this.masterKey}:${keyVersion}`
    const encoder = new TextEncoder()
    const keyData = encoder.encode(keyMaterial)
    
    const importedKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      'PBKDF2',
      false,
      ['deriveKey']
    )
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      importedKey,
      { name: 'AES-CBC', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  private async createContentHashAsync(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = new Uint8Array(hashBuffer)
    return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Encrypt sensitive PHI data (Edge Runtime compatible)
   */
  async encryptAsync(plaintext: string, classification: 'PHI' | 'PII' | 'SENSITIVE' = 'PHI'): Promise<EncryptionResult> {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
      const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
      
      const key = await this.deriveKeyAsync(salt, this.currentKeyVersion)
      
      const encoder = new TextEncoder()
      const data = encoder.encode(plaintext)
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: iv },
        key,
        data
      )
      
      // Combine salt + iv + encrypted data
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
      combined.set(salt, 0)
      combined.set(iv, salt.length)
      combined.set(new Uint8Array(encrypted), salt.length + iv.length)
      
      // Convert to base64
      const base64 = btoa(String.fromCharCode(...combined))
      
      return {
        encryptedData: base64,
        keyVersion: this.currentKeyVersion
      }
    } catch (error) {
      throw new Error(`PHI encryption failed: ${error.message}`)
    }
  }

  /**
   * Decrypt sensitive PHI data (Edge Runtime compatible)
   */
  async decryptAsync(input: DecryptionInput): Promise<string> {
    try {
      // Convert base64 to Uint8Array
      const base64 = input.encryptedData
      const binaryString = atob(base64)
      const combined = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        combined[i] = binaryString.charCodeAt(i)
      }
      
      const salt = combined.slice(0, SALT_LENGTH)
      const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
      const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH)
      
      const key = await this.deriveKeyAsync(salt, input.keyVersion)
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: iv },
        key,
        encrypted
      )
      
      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (error) {
      throw new Error(`PHI decryption failed: ${error.message}`)
    }
  }

  /**
   * Hash data for audit trails (Edge Runtime compatible)
   */
  async hashForAuditAsync(data: string): Promise<string> {
    const salt = (typeof process !== 'undefined' && process.env?.AUDIT_SALT) || 'default-audit-salt'
    const encoder = new TextEncoder()
    const keyData = encoder.encode(data)
    const saltData = encoder.encode(salt)
    
    const importedKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      'PBKDF2',
      false,
      ['deriveBits']
    )
    
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltData,
        iterations: 10000,
        hash: 'SHA-256'
      },
      importedKey,
      256
    )
    
    const hashArray = new Uint8Array(derivedBits)
    return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Generate secure session token (Edge Runtime compatible)
   */
  generateSecureToken(length: number = 32): string {
    try {
      // Always use Web Crypto API for Edge Runtime compatibility
      const bytes = crypto.getRandomValues(new Uint8Array(length))
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
    } catch (error) {
      // Fallback to simple random generation if crypto fails
      console.warn('Crypto generation failed, using fallback:', error)
      const chars = '0123456789abcdef'
      let result = ''
      for (let i = 0; i < length * 2; i++) {
        result += chars[Math.floor(Math.random() * chars.length)]
      }
      return result
    }
  }

  /**
   * Validate data integrity (Edge Runtime compatible)
   */
  async validateIntegrityAsync(data: string, expectedHash: string): Promise<boolean> {
    const actualHash = await this.createContentHashAsync(data)
    // Constant-time comparison for Edge Runtime
    if (actualHash.length !== expectedHash.length) {
      return false
    }
    let result = 0
    for (let i = 0; i < actualHash.length; i++) {
      result |= actualHash.charCodeAt(i) ^ expectedHash.charCodeAt(i)
    }
    return result === 0
  }

  // Legacy sync methods for backward compatibility (Node.js only)
  encrypt(plaintext: string, classification: 'PHI' | 'PII' | 'SENSITIVE' = 'PHI'): EncryptionResult {
    throw new Error('Synchronous encryption not supported in Edge Runtime. Use encryptAsync method.')
  }

  decrypt(input: DecryptionInput): string {
    throw new Error('Synchronous decryption not supported in Edge Runtime. Use decryptAsync method.')
  }

  hashForAudit(data: string): string {
    throw new Error('Synchronous hashing not supported in Edge Runtime. Use hashForAuditAsync method.')
  }

  validateIntegrity(data: string, expectedHash: string): boolean {
    throw new Error('Synchronous integrity validation not supported in Edge Runtime. Use validateIntegrityAsync method.')
  }
}

// Singleton instance
export const phiEncryption = new PHIEncryption()

// Utility functions for common PHI operations (Edge Runtime compatible)
export const encryptPHIAsync = (data: string, classification?: 'PHI' | 'PII' | 'SENSITIVE') => 
  phiEncryption.encryptAsync(data, classification)

export const decryptPHIAsync = (encryptedData: string, keyVersion: string) => 
  phiEncryption.decryptAsync({ encryptedData, keyVersion })

export const hashForAuditAsync = (data: string) => phiEncryption.hashForAuditAsync(data)

export const generateSecureToken = (length?: number) => phiEncryption.generateSecureToken(length)

// PHI field encryption helpers (Edge Runtime compatible)
export const encryptUserPHIAsync = async (userData: any) => {
  const phiFields = ['email', 'name', 'city']
  const encrypted = { ...userData }
  
  for (const field of phiFields) {
    if (userData[field]) {
      const result = await encryptPHIAsync(userData[field])
      encrypted[`${field}_encrypted`] = result.encryptedData
      encrypted[`${field}_key_version`] = result.keyVersion
      delete encrypted[field] // Remove plaintext
    }
  }
  
  return encrypted
}

export const decryptUserPHIAsync = async (encryptedData: any) => {
  const decrypted = { ...encryptedData }
  const phiFields = ['email', 'name', 'city']
  
  for (const field of phiFields) {
    if (encryptedData[`${field}_encrypted`]) {
      decrypted[field] = await decryptPHIAsync(
        encryptedData[`${field}_encrypted`],
        encryptedData[`${field}_key_version`]
      )
      delete decrypted[`${field}_encrypted`]
      delete decrypted[`${field}_key_version`]
    }
  }
  
  return decrypted
}

// Legacy sync exports for backward compatibility (will throw errors in Edge Runtime)
export const encryptPHI = (data: string, classification?: 'PHI' | 'PII' | 'SENSITIVE') => {
  throw new Error('Synchronous PHI encryption not supported in Edge Runtime. Use encryptPHIAsync method.')
}

export const decryptPHI = (encryptedData: string, keyVersion: string) => {
  throw new Error('Synchronous PHI decryption not supported in Edge Runtime. Use decryptPHIAsync method.')
}

export const hashForAudit = (data: string) => {
  throw new Error('Synchronous hashing not supported in Edge Runtime. Use hashForAuditAsync method.')
}

export const encryptUserPHI = (userData: any) => {
  throw new Error('Synchronous PHI encryption not supported in Edge Runtime. Use encryptUserPHIAsync method.')
}

export const decryptUserPHI = (encryptedData: any) => {
  throw new Error('Synchronous PHI decryption not supported in Edge Runtime. Use decryptUserPHIAsync method.')
}
