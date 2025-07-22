
// HIPAA-Compliant Field-Level Encryption Utilities
// AES-256-GCM encryption for PHI data protection

import * as crypto from 'crypto'

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
    return crypto.randomBytes(KEY_LENGTH).toString('hex')
  }

  private deriveKey(salt: Buffer, keyVersion: string): Buffer {
    const keyMaterial = `${this.masterKey}:${keyVersion}`
    return crypto.pbkdf2Sync(keyMaterial, salt, 100000, KEY_LENGTH, 'sha256')
  }

  private createContentHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  /**
   * Encrypt sensitive PHI data
   */
  encrypt(plaintext: string, classification: 'PHI' | 'PII' | 'SENSITIVE' = 'PHI'): EncryptionResult {
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
   * Decrypt sensitive PHI data
   */
  decrypt(input: DecryptionInput): string {
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
   * Hash data for audit trails (one-way)
   */
  hashForAudit(data: string): string {
    const salt = process.env.AUDIT_SALT || 'default-audit-salt'
    return crypto.pbkdf2Sync(data, salt, 10000, 32, 'sha256').toString('hex')
  }

  /**
   * Generate secure session token
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Validate data integrity
   */
  validateIntegrity(data: string, expectedHash: string): boolean {
    const actualHash = this.createContentHash(data)
    return crypto.timingSafeEqual(
      Buffer.from(expectedHash, 'hex'),
      Buffer.from(actualHash, 'hex')
    )
  }
}

// Singleton instance
export const phiEncryption = new PHIEncryption()

// Utility functions for common PHI operations
export const encryptPHI = (data: string, classification?: 'PHI' | 'PII' | 'SENSITIVE') => 
  phiEncryption.encrypt(data, classification)

export const decryptPHI = (encryptedData: string, keyVersion: string) => 
  phiEncryption.decrypt({ encryptedData, keyVersion })

export const hashForAudit = (data: string) => phiEncryption.hashForAudit(data)

export const generateSecureToken = (length?: number) => phiEncryption.generateSecureToken(length)

// PHI field encryption helpers
export const encryptUserPHI = (userData: any) => {
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

export const decryptUserPHI = (encryptedData: any) => {
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
