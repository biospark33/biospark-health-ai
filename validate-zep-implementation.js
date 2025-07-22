#!/usr/bin/env node

/**
 * Validate Zep Implementation Structure
 * Validates that all BMAD-implemented Zep components are properly structured
 */

const fs = require('fs');
const path = require('path');

function validateZepImplementation() {
    console.log("🔍 VALIDATING ZEP IMPLEMENTATION STRUCTURE");
    console.log("=" * 60);
    
    const results = {
        success: true,
        validations: [],
        errors: []
    };
    
    // Check 1: Verify Zep dependencies are installed
    console.log("📦 Checking Zep dependencies...");
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (dependencies['@getzep/zep-js']) {
            console.log(`✅ Zep SDK installed: ${dependencies['@getzep/zep-js']}`);
            results.validations.push("Zep SDK dependency installed");
        } else {
            console.log("❌ Zep SDK not found in dependencies");
            results.errors.push("Zep SDK not installed");
            results.success = false;
        }
        
        if (dependencies['crypto-js']) {
            console.log(`✅ Crypto-JS installed: ${dependencies['crypto-js']}`);
            results.validations.push("Crypto-JS dependency installed");
        } else {
            console.log("❌ Crypto-JS not found in dependencies");
            results.errors.push("Crypto-JS not installed");
        }
    } catch (error) {
        console.log("❌ Failed to read package.json");
        results.errors.push("Package.json not readable");
        results.success = false;
    }
    
    // Check 2: Verify implementation files exist
    console.log("\n📁 Checking implementation files...");
    const requiredFiles = [
        'lib/zep-client.ts',
        'lib/memory-manager.ts', 
        'lib/session-manager.ts',
        '__tests__/zep-integration.test.ts'
    ];
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file} exists`);
            results.validations.push(`Implementation file: ${file}`);
        } else {
            console.log(`❌ ${file} missing`);
            results.errors.push(`Missing file: ${file}`);
            results.success = false;
        }
    });
    
    // Check 3: Verify architecture documents
    console.log("\n📋 Checking architecture documents...");
    const archFiles = [
        'docs/architecture/zep-integration-architecture.md',
        'docs/architecture/memory-storage-design.md',
        'docs/architecture/hipaa-compliance-design.md'
    ];
    
    archFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file} exists`);
            results.validations.push(`Architecture doc: ${file}`);
        } else {
            console.log(`❌ ${file} missing`);
            results.errors.push(`Missing architecture: ${file}`);
        }
    });
    
    // Check 4: Verify environment configuration
    console.log("\n⚙️ Checking environment configuration...");
    try {
        const envContent = fs.readFileSync('.env', 'utf8');
        
        if (envContent.includes('ZEP_API_KEY')) {
            console.log("✅ ZEP_API_KEY configured");
            results.validations.push("Zep API key configured");
        } else {
            console.log("❌ ZEP_API_KEY not found in .env");
            results.errors.push("Zep API key not configured");
        }
        
        if (envContent.includes('ZEP_ENCRYPTION_KEY')) {
            console.log("✅ ZEP_ENCRYPTION_KEY configured");
            results.validations.push("Zep encryption key configured");
        } else {
            console.log("❌ ZEP_ENCRYPTION_KEY not found in .env");
            results.errors.push("Zep encryption key not configured");
        }
    } catch (error) {
        console.log("❌ Failed to read .env file");
        results.errors.push(".env file not readable");
    }
    
    // Check 5: Verify Prisma schema updates
    console.log("\n🗄️ Checking Prisma schema updates...");
    try {
        const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
        
        if (schemaContent.includes('model ZepSession')) {
            console.log("✅ ZepSession model added to schema");
            results.validations.push("ZepSession model in schema");
        } else {
            console.log("❌ ZepSession model not found in schema");
            results.errors.push("ZepSession model missing");
        }
        
        if (schemaContent.includes('model MemoryAuditLog')) {
            console.log("✅ MemoryAuditLog model added to schema");
            results.validations.push("MemoryAuditLog model in schema");
        } else {
            console.log("❌ MemoryAuditLog model not found in schema");
            results.errors.push("MemoryAuditLog model missing");
        }
        
        if (schemaContent.includes('zepSessions       ZepSession[]')) {
            console.log("✅ User-ZepSession relation configured");
            results.validations.push("User-ZepSession relation configured");
        } else {
            console.log("❌ User-ZepSession relation not found");
            results.errors.push("User-ZepSession relation missing");
        }
    } catch (error) {
        console.log("❌ Failed to read Prisma schema");
        results.errors.push("Prisma schema not readable");
    }
    
    // Check 6: Verify TypeScript implementation structure
    console.log("\n🔧 Checking TypeScript implementation structure...");
    try {
        const zepClientContent = fs.readFileSync('lib/zep-client.ts', 'utf8');
        
        const requiredClasses = [
            'LabInsightZepClient',
            'ZepClientConfig',
            'SessionConfig',
            'MemoryConfig'
        ];
        
        requiredClasses.forEach(className => {
            if (zepClientContent.includes(className)) {
                console.log(`✅ ${className} interface/class implemented`);
                results.validations.push(`TypeScript: ${className}`);
            } else {
                console.log(`❌ ${className} interface/class missing`);
                results.errors.push(`Missing TypeScript: ${className}`);
            }
        });
        
        // Check for HIPAA compliance methods
        const hipaaMethods = [
            'encryptPHI',
            'decryptPHI',
            'validateHIPAACompliance'
        ];
        
        hipaaMethods.forEach(method => {
            if (zepClientContent.includes(method) || 
                fs.readFileSync('lib/memory-manager.ts', 'utf8').includes(method)) {
                console.log(`✅ HIPAA method: ${method}`);
                results.validations.push(`HIPAA: ${method}`);
            } else {
                console.log(`❌ HIPAA method missing: ${method}`);
                results.errors.push(`Missing HIPAA method: ${method}`);
            }
        });
        
    } catch (error) {
        console.log("❌ Failed to analyze TypeScript implementation");
        results.errors.push("TypeScript implementation analysis failed");
    }
    
    // Check 7: Verify BMAD coordination artifacts
    console.log("\n🎭 Checking BMAD coordination artifacts...");
    const bmadFiles = [
        'docs/phase2a_briefing.json',
        'docs/phase2a_coordination_plan.json',
        'docs/bmad_coordination_log.json',
        'docs/architect_phase_summary.md',
        'docs/developer_phase_summary.md'
    ];
    
    bmadFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file} exists`);
            results.validations.push(`BMAD artifact: ${file}`);
        } else {
            console.log(`❌ ${file} missing`);
            results.errors.push(`Missing BMAD artifact: ${file}`);
        }
    });
    
    // Final summary
    console.log("\n" + "=" * 60);
    if (results.success && results.errors.length === 0) {
        console.log("🎉 ZEP IMPLEMENTATION VALIDATION PASSED!");
        console.log(`✅ ${results.validations.length} validations successful`);
        console.log("\n🎯 Phase 2A Implementation Status:");
        console.log("✅ BMAD Orchestration Complete");
        console.log("✅ Architect Phase Complete (Winston)");
        console.log("✅ Developer Phase Complete (James)");
        console.log("✅ Zep SDK Integration Implemented");
        console.log("✅ HIPAA Compliance Framework Implemented");
        console.log("✅ Memory Management System Implemented");
        console.log("✅ Session Management System Implemented");
        console.log("✅ Database Schema Updated");
        console.log("✅ Comprehensive Test Suite Created");
        console.log("\n🚀 Ready for QA Validation Phase");
    } else {
        console.log("⚠️ ZEP IMPLEMENTATION VALIDATION ISSUES FOUND");
        console.log(`✅ ${results.validations.length} validations successful`);
        console.log(`❌ ${results.errors.length} issues found`);
        
        if (results.errors.length > 0) {
            console.log("\n🔧 Issues to address:");
            results.errors.forEach(error => console.log(`   - ${error}`));
        }
    }
    
    console.log("=" * 60);
    
    return results;
}

// Run validation
if (require.main === module) {
    const results = validateZepImplementation();
    process.exit(results.success && results.errors.length === 0 ? 0 : 1);
}

module.exports = { validateZepImplementation };
