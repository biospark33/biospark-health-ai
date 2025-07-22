/**
 * Enhanced Input Validation - HIPAA-Compliant Data Validation
 * LabInsight AI Health Analysis Platform
 * 
 * SECURITY FEATURES:
 * - Comprehensive input sanitization
 * - PHI data validation and protection
 * - SQL injection prevention
 * - XSS protection
 * - Data integrity validation
 */

import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

/**
 * HIPAA-Compliant Input Validation Class
 * 
 * Provides comprehensive input validation and sanitization
 * for all Zep integration components with healthcare data protection
 */
export class InputValidator {
  
  /**
   * Validate and Sanitize User Input
   * 
   * @param input - Raw user input
   * @param type - Type of input (text, email, phone, etc.)
   * @returns Sanitized and validated input
   */
  static validateAndSanitize(input: any, type: string = 'text'): string {
    if (!input) {
      throw new Error('Input validation failed: Input is required');
    }
    
    // Convert to string and trim
    let sanitized = String(input).trim();
    
    // Basic length validation
    if (sanitized.length > 10000) {
      throw new Error('Input validation failed: Input too long');
    }
    
    // Type-specific validation
    switch (type) {
      case 'email':
        if (!validator.isEmail(sanitized)) {
          throw new Error('Input validation failed: Invalid email format');
        }
        break;
        
      case 'phone':
        sanitized = sanitized.replace(/[^0-9+\-\(\)\s]/g, '');
        if (!validator.isMobilePhone(sanitized, 'any')) {
          throw new Error('Input validation failed: Invalid phone format');
        }
        break;
        
      case 'alphanumeric':
        if (!validator.isAlphanumeric(sanitized)) {
          throw new Error('Input validation failed: Only alphanumeric characters allowed');
        }
        break;
        
      case 'html':
        // Sanitize HTML to prevent XSS
        sanitized = DOMPurify.sanitize(sanitized);
        break;
        
      case 'text':
      default:
        // Remove potentially dangerous characters
        sanitized = sanitized.replace(/[<>"'&]/g, '');
        break;
    }
    
    return sanitized;
  }
  
  /**
   * Validate PHI Data (HIPAA-Compliant)
   * 
   * @param phi - Protected Health Information
   * @returns Validated PHI data
   */
  static validatePHI(phi: any): any {
    if (!phi || typeof phi !== 'object') {
      throw new Error('PHI validation failed: Invalid PHI data structure');
    }
    
    const validatedPHI: any = {};
    
    // Validate each PHI field
    for (const [key, value] of Object.entries(phi)) {
      if (value !== null && value !== undefined) {
        validatedPHI[key] = this.validateAndSanitize(value, this.getPHIFieldType(key));
      }
    }
    
    return validatedPHI;
  }
  
  /**
   * Get PHI Field Type for Validation
   * 
   * @param fieldName - PHI field name
   * @returns Validation type
   */
  private static getPHIFieldType(fieldName: string): string {
    const fieldTypes: { [key: string]: string } = {
      'email': 'email',
      'phone': 'phone',
      'phoneNumber': 'phone',
      'patientId': 'alphanumeric',
      'userId': 'alphanumeric',
      'sessionId': 'alphanumeric',
      'notes': 'html',
      'description': 'html',
      'analysis': 'html'
    };
    
    return fieldTypes[fieldName] || 'text';
  }
  
  /**
   * Validate Memory Data for Zep Storage
   * 
   * @param memoryData - Memory data to validate
   * @returns Validated memory data
   */
  static validateMemoryData(memoryData: any): any {
    if (!memoryData) {
      throw new Error('Memory validation failed: Memory data is required');
    }
    
    const validated: any = {};
    
    // Validate required fields
    if (!memoryData.userId) {
      throw new Error('Memory validation failed: User ID is required');
    }
    
    if (!memoryData.sessionId) {
      throw new Error('Memory validation failed: Session ID is required');
    }
    
    // Validate and sanitize fields
    validated.userId = this.validateAndSanitize(memoryData.userId, 'alphanumeric');
    validated.sessionId = this.validateAndSanitize(memoryData.sessionId, 'alphanumeric');
    
    if (memoryData.content) {
      validated.content = this.validateAndSanitize(memoryData.content, 'html');
    }
    
    if (memoryData.metadata) {
      validated.metadata = this.validatePHI(memoryData.metadata);
    }
    
    return validated;
  }
  
  /**
   * Validate Session Data
   * 
   * @param sessionData - Session data to validate
   * @returns Validated session data
   */
  static validateSessionData(sessionData: any): any {
    if (!sessionData) {
      throw new Error('Session validation failed: Session data is required');
    }
    
    const validated: any = {};
    
    // Validate required fields
    if (!sessionData.userId) {
      throw new Error('Session validation failed: User ID is required');
    }
    
    validated.userId = this.validateAndSanitize(sessionData.userId, 'alphanumeric');
    
    if (sessionData.metadata) {
      validated.metadata = this.validatePHI(sessionData.metadata);
    }
    
    if (sessionData.userAgent) {
      validated.userAgent = this.validateAndSanitize(sessionData.userAgent, 'text');
    }
    
    if (sessionData.ipAddress) {
      if (!validator.isIP(sessionData.ipAddress)) {
        throw new Error('Session validation failed: Invalid IP address');
      }
      validated.ipAddress = sessionData.ipAddress;
    }
    
    return validated;
  }
}

export default InputValidator;
