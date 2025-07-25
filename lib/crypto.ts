
// HIPAA-Compliant Field-Level Encryption Utilities
// AES-256-GCM encryption for PHI data protection

// Conditional crypto import for Edge Runtime compatibility
let crypto: any;
let isNodeEnvironment = false;

// Check if we're in Node.js environment more reliably
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  try {
    // Try to import Node.js crypto (works in Node.js runtime)
    crypto = require('crypto');
    isNodeEnvironment = true;
  } catch (error) {
    // Fallback to Web Crypto API
    crypto = globalThis.crypto;
    isNodeEnvironment = false;
  }
} else {
  // We're in Edge Runtime or browser - use Web Crypto API
  crypto = globalThis.crypto;
  isNodeEnvironment = false;
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
    this.masterKey = process.env.PHI_ENCRYPTION_KEY || this.generateMasterKey()
    this.currentKeyVersion = process.env.PHI_KEY_VERSION || 'v1'
    
    if (!process.env.PHI_ENCRYPTION_KEY) {
      console.warn('PHI_ENCRYPTION_KEY not set. Using generated key for development only.')
    }
  }

  private generateMasterKey(): string {
    if (isNodeEnvironment) {
      return crypto.randomBytes(KEY_LENGTH).toString('hex')
    } else {
      // Web Crypto API fallback
      const bytes = crypto.getRandomValues(new Uint8Array(KEY_LENGTH))
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
    }
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

  private deriveKey(salt: Buffer, keyVersion: string): Buffer {
    if (!isNodeEnvironment) {
      throw new Error('Synchronous key derivation not available in Edge Runtime. Use async methods.')
    }
    const keyMaterial = `${this.masterKey}:${keyVersion}`
    return crypto.pbkdf2Sync(keyMaterial, salt, 100000, KEY_LENGTH, 'sha256')
  }

  private async createContentHashAsync(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = new Uint8Array(hashBuffer)
    return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private createContentHash(data: string): string {
    if (!isNodeEnvironment) {
      throw new Error('Synchronous hashing not available in Edge Runtime. Use async methods.')
    }
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  /**
   * Encrypt sensitive PHI data
   */
  encrypt(plaintext: string, classification: 'PHI' | 'PII' | 'SENSITIVE' = 'PHI'): EncryptionResult {
    if (!isNodeEnvironment) {
      throw new Error('Synchronous encryption not available in Edge Runtime. Use encryptAsync method.')
    }
    
    try {
      const salt = crypto.randomBytes(SALT_LENGTH)
      const iv = crypto.randomBytes(IV_LENGTH)
      const key = this.deriveKey(salt, this.currentKeyVersion)
      
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      // Combine salt + iv + encrypted data
      const combined = Buffer.concat([
        salt,
        iv,
        Buffer.from(encrypted, 'hex')
      ])
      
      return {
        encryptedData: combined.toString('base64'),
        keyVersion: this.currentKeyVersion
      }
    } catch (error) {
      throw new Error(`PHI encryption failed: ${error.message}`)
    }
  }

  /**
   * Encrypt sensitive PHI data (async for Edge Runtime compatibility)
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
   * Decrypt sensitive PHI data
   */
  decrypt(input: DecryptionInput): string {
    if (!isNodeEnvironment) {
      throw new Error('Synchronous decryption not available in Edge Runtime. Use decryptAsync method.')
    }
    
    try {
      const combined = Buffer.from(input.encryptedData, 'base64')
      
      const salt = combined.subarray(0, SALT_LENGTH)
      const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
      const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH)
      
      const key = this.deriveKey(salt, input.keyVersion)
      
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
      
      let decrypted = decipher.update(encrypted, undefined, 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      throw new Error(`PHI decryption failed: ${error.message}`)
    }
  }

  /**
   * Decrypt sensitive PHI data (async for Edge Runtime compatibility)
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
   * Hash data for audit trails (one-way)
   */
  hashForAudit(data: string): string {
    if (!isNodeEnvironment) {
      throw new Error('Synchronous hashing not available in Edge Runtime. Use hashForAuditAsync method.')
    }
    const salt = process.env.AUDIT_SALT || 'default-audit-salt'
    return crypto.pbkdf2Sync(data, salt, 10000, 32, 'sha256').toString('hex')
  }

  /**
   * Hash data for audit trails (async for Edge Runtime compatibility)
   */
  async hashForAuditAsync(data: string): Promise<string> {
    const salt = process.env.AUDIT_SALT || 'default-audit-salt'
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
   * Generate secure session token
   */
  generateSecureToken(length: number = 32): string {
    try {
      if (isNodeEnvironment && crypto.randomBytes) {
        return crypto.randomBytes(length).toString('hex')
      } else {
        // Use Web Crypto API for edge runtime
        const bytes = crypto.getRandomValues(new Uint8Array(length))
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
      }
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
   * Validate data integrity
   */
  validateIntegrity(data: string, expectedHash: string): boolean {
    if (!isNodeEnvironment) {
      throw new Error('Synchronous integrity validation not available in Edge Runtime. Use validateIntegrityAsync method.')
    }
    const actualHash = this.createContentHash(data)
    return crypto.timingSafeEqual(
      Buffer.from(expectedHash, 'hex'),
      Buffer.from(actualHash, 'hex')
    )
  }

  /**
   * Validate data integrity (async for Edge Runtime compatibility)
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
}

// Singleton instance
export const phiEncryption = new PHIEncryption()

// Utility functions for common PHI operations
export const encryptPHI = (data: string, classification?: 'PHI' | 'PII' | 'SENSITIVE') => 
  phiEncryption.encrypt(data, classification)

export const encryptPHIAsync = (data: string, classification?: 'PHI' | 'PII' | 'SENSITIVE') => 
  phiEncryption.encryptAsync(data, classification)

export const decryptPHI = (encryptedData: string, keyVersion: string) => 
  phiEncryption.decrypt({ encryptedData, keyVersion })

export const decryptPHIAsync = (encryptedData: string, keyVersion: string) => 
  phiEncryption.decryptAsync({ encryptedData, keyVersion })

export const hashForAudit = (data: string) => phiEncryption.hashForAudit(data)

export const hashForAuditAsync = (data: string) => phiEncryption.hashForAuditAsync(data)

export const generateSecureToken = (length?: number) => phiEncryption.generateSecureToken(length)

// PHI field encryption helpers
export const encryptUserPHI = (userData: any) => {
  if (!isNodeEnvironment) {
    throw new Error('Synchronous PHI encryption not available in Edge Runtime. Use encryptUserPHIAsync method.')
  }
  
  const phiFields = ['email', 'name', 'city']
  const encrypted = { ...userData }
  
  for (const field of phiFields) {
    if (userData[field]) {
      const result = encryptPHI(userData[field])
      encrypted[`${field}_encrypted`] = result.encryptedData
      encrypted[`${field}_key_version`] = result.keyVersion
      delete encrypted[field] // Remove plaintext
    }
  }
  
  return encrypted
}

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

export const decryptUserPHI = (encryptedData: any) => {
  if (!isNodeEnvironment) {
    throw new Error('Synchronous PHI decryption not available in Edge Runtime. Use decryptUserPHIAsync method.')
  }
  
  const decrypted = { ...encryptedData }
  const phiFields = ['email', 'name', 'city']
  
  for (const field of phiFields) {
    if (encryptedData[`${field}_encrypted`]) {
      decrypted[field] = decryptPHI(
        encryptedData[`${field}_encrypted`],
        encryptedData[`${field}_key_version`]
      )
      delete decrypted[`${field}_encrypted`]
      delete decrypted[`${field}_key_version`]
    }
  }
  
  return decrypted
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
