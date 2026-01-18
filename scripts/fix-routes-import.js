// Script to fix the missing import in the auto-generated routes.ts file
const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, '..', 'src', 'routes.ts');

try {
  let content = fs.readFileSync(routesPath, 'utf8');
  
  // Check if the import is already there
  if (content.includes("import { expressAuthenticationRecasted } from './authentication'")) {
    console.log('✓ Import already exists in routes.ts');
    process.exit(0);
  }
  
  // Find the line with the Express imports
  const expressImportLine = "import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';";
  
  if (content.includes(expressImportLine)) {
    // Add our import right after the Express import
    const newImport = `${expressImportLine}\nimport { expressAuthenticationRecasted } from './authentication';`;
    content = content.replace(expressImportLine, newImport);
    
    fs.writeFileSync(routesPath, content, 'utf8');
    console.log('✓ Successfully added authentication import to routes.ts');
  } else {
    console.error('✗ Could not find Express import line in routes.ts');
    process.exit(1);
  }
} catch (error) {
  console.error('✗ Error fixing routes.ts:', error.message);
  process.exit(1);
}
