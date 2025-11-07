


		
// scripts/print-audit-summary.js
// Added for Milestone 5: Automated Security Testing
// This script summarizes vulnerabilities from npm audit

try {
  const auditData = require('../npm-audit.json')
  console.log('Vulnerability Summary:\n')
  console.table(auditData.metadata?.vulnerabilities || {})
} catch (e) {
  console.log('No npm-audit.json found. Run `npm run security:npm-audit` first.')
}

