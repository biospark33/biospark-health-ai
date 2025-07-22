
// Security Configuration Lint
// Validates security configurations and checks for potential issues
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './.env.production' });

function securityLint() {
  console.log('Running security configuration lint...');
  
  const issues = [];
  const warnings = [];
  
  // Check for HTTPS URLs
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && !appUrl.startsWith('https://')) {
    issues.push('APP_URL should use HTTPS in production');
  }
  
  // Check for NextAuth URL
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl && !nextAuthUrl.startsWith('https://')) {
    issues.push('NEXTAUTH_URL should use HTTPS in production');
  }
  
  // Check for required secrets
  const requiredSecrets = [
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
    'ENCRYPTION_MASTER_KEY'
  ];
  
  requiredSecrets.forEach(secret => {
    const value = process.env[secret];
    if (!value) {
      issues.push(`Missing required secret: ${secret}`);
    } else if (value.length < 32) {
      warnings.push(`${secret} should be at least 32 characters long`);
    }
  });
  
  // Check for placeholder values
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (stripeSecret && stripeSecret.includes('PLACEHOLDER')) {
    warnings.push('Stripe keys are still using placeholder values');
  }
  
  // Check for NODE_ENV
  if (process.env.NODE_ENV !== 'production') {
    warnings.push('NODE_ENV should be set to "production"');
  }
  
  // Scan for potential console.log statements that might leak secrets
  try {
    const appDir = './app';
    const files = getAllFiles(appDir, ['.ts', '.tsx', '.js']);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('console.log') && content.includes('process.env')) {
        warnings.push(`Potential secret logging in ${file}`);
      }
    });
  } catch (error) {
    warnings.push('Could not scan files for console.log statements');
  }
  
  // Report results
  if (issues.length === 0 && warnings.length === 0) {
    console.log('OK - Security lint passed with no issues');
    return true;
  }
  
  if (issues.length > 0) {
    console.log('FAIL - Security issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.log('WARN - Security warnings:');
    warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  return issues.length === 0;
}

function getAllFiles(dir, extensions) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    });
  }
  
  traverse(dir);
  return files;
}

const success = securityLint();
process.exit(success ? 0 : 1);
