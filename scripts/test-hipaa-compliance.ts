
// HIPAA Compliance Testing Script
// Validates all HIPAA compliance features

import { auditLogger } from '../lib/audit'
import { phiEncryption, encryptPHI, decryptPHI } from '../lib/crypto'
import { RBACManager, UserContext } from '../lib/rbac'
import { consentManager } from '../lib/consent'
import { UserRole, Permission } from '../lib/rbac'

async function testHIPAACompliance() {
  console.log('🧪 Testing HIPAA Compliance System...')
  
  let passed = 0
  let failed = 0

  // Test 1: Audit Logging
  console.log('\n📝 Testing Audit Logging...')
  try {
    await auditLogger.logEvent({
      userId: 'test-user-123',
      eventType: 'data_access',
      resource: 'health_assessment',
      action: 'read',
      ipAddress: '127.0.0.1',
      endpoint: '/api/test',
      method: 'GET',
      success: true,
      riskLevel: 'low'
    })
    console.log('✅ Audit logging test passed')
    passed++
  } catch (error) {
    console.log('❌ Audit logging test failed:', error.message)
    failed++
  }

  // Test 2: PHI Encryption
  console.log('\n🔐 Testing PHI Encryption...')
  try {
    const testData = 'john.doe@example.com'
    const encrypted = encryptPHI(testData)
    const decrypted = decryptPHI(encrypted.encryptedData, encrypted.keyVersion)
    
    if (decrypted === testData) {
      console.log('✅ PHI encryption/decryption test passed')
      passed++
    } else {
      throw new Error('Decrypted data does not match original')
    }
  } catch (error) {
    console.log('❌ PHI encryption test failed:', error.message)
    failed++
  }

  // Test 3: RBAC System
  console.log('\n👥 Testing RBAC System...')
  try {
    const patientContext: UserContext = {
      userId: 'patient-123',
      roles: [UserRole.PATIENT],
      permissions: [Permission.READ_OWN_DATA, Permission.WRITE_OWN_DATA]
    }

    const adminContext: UserContext = {
      userId: 'admin-123',
      roles: [UserRole.ADMIN],
      permissions: [Permission.READ_ALL_DATA, Permission.MANAGE_USERS, Permission.VIEW_AUDIT_LOGS]
    }

    // Test patient can access own data
    const patientCanRead = RBACManager.canAccessResource(
      patientContext, 
      'health_assessment', 
      'read', 
      'patient-123'
    )

    // Test patient cannot access other's data
    const patientCannotReadOthers = !RBACManager.canAccessResource(
      patientContext, 
      'health_assessment', 
      'read', 
      'other-user-123'
    )

    // Test admin can access all data
    const adminCanReadAll = RBACManager.canAccessResource(
      adminContext, 
      'health_assessment', 
      'read', 
      'any-user-123'
    )

    if (patientCanRead && patientCannotReadOthers && adminCanReadAll) {
      console.log('✅ RBAC system test passed')
      passed++
    } else {
      throw new Error('RBAC access control validation failed')
    }
  } catch (error) {
    console.log('❌ RBAC system test failed:', error.message)
    failed++
  }

  // Test 4: Consent Management
  console.log('\n📋 Testing Consent Management...')
  try {
    const mockRequest = {
      headers: { 'user-agent': 'test-agent' },
      ip: '127.0.0.1'
    }

    await consentManager.recordConsent(
      'test-user-123',
      'data_processing',
      true,
      mockRequest
    )

    const hasConsent = await consentManager.hasValidConsent(
      'test-user-123',
      'data_processing'
    )

    if (hasConsent) {
      console.log('✅ Consent management test passed')
      passed++
    } else {
      throw new Error('Consent validation failed')
    }
  } catch (error) {
    console.log('❌ Consent management test failed:', error.message)
    failed++
  }

  // Test 5: Data Integrity
  console.log('\n🔍 Testing Data Integrity...')
  try {
    const testData = 'sensitive health data'
    const hash1 = phiEncryption.hashForAudit(testData)
    const hash2 = phiEncryption.hashForAudit(testData)
    
    if (hash1 === hash2) {
      console.log('✅ Data integrity hashing test passed')
      passed++
    } else {
      throw new Error('Hash consistency check failed')
    }
  } catch (error) {
    console.log('❌ Data integrity test failed:', error.message)
    failed++
  }

  // Test 6: Security Token Generation
  console.log('\n🎫 Testing Security Token Generation...')
  try {
    const token1 = phiEncryption.generateSecureToken(32)
    const token2 = phiEncryption.generateSecureToken(32)
    
    if (token1.length === 64 && token2.length === 64 && token1 !== token2) {
      console.log('✅ Security token generation test passed')
      passed++
    } else {
      throw new Error('Token generation validation failed')
    }
  } catch (error) {
    console.log('❌ Security token generation test failed:', error.message)
    failed++
  }

  // Summary
  console.log('\n📊 HIPAA Compliance Test Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)

  if (failed === 0) {
    console.log('\n🎉 All HIPAA compliance tests passed!')
    return true
  } else {
    console.log('\n⚠️  Some HIPAA compliance tests failed. Please review and fix issues.')
    return false
  }
}

// Run tests if called directly
if (require.main === module) {
  testHIPAACompliance()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error('💥 HIPAA compliance testing failed:', error)
      process.exit(1)
    })
}

export { testHIPAACompliance }
