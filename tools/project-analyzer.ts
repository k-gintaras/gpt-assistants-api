import * as fs from 'fs';
import * as path from 'path';

// Directories to analyze
const CONTROLLERS_DIR = path.join(__dirname, '../src/controllers');
const ROUTES_DIR = path.join(__dirname, '../src/routes');
const MODELS_DIR = path.join(__dirname, '../src/models');
const SERVICES_DIR = path.join(__dirname, '../src/services');

// Function to list files in a directory
const listFiles = (dir: string): string[] => {
  if (fs.existsSync(dir)) {
    return fs.readdirSync(dir).filter(file => file.endsWith('.ts'));
  }
  return [];
};

// Analyze project structure
console.log('=== Project Analyzer ===');
console.log('Controllers:', listFiles(CONTROLLERS_DIR));
console.log('Routes:', listFiles(ROUTES_DIR));
console.log('Models:', listFiles(MODELS_DIR));
console.log('Services:', listFiles(SERVICES_DIR));
console.log('=== End Analysis ===');
