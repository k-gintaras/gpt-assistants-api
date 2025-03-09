import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Paths for different parts of the app
const SERVICES_DIR = path.join(__dirname, 'services/sqlite-services');
const CONTROLLER_SERVICES_DIR = path.join(__dirname, 'services/core-services');
const CONTROLLERS_DIR = path.join(__dirname, 'controllers');
const ROUTES_DIR = path.join(__dirname, 'routes');
const APP_FILE = path.join(__dirname, 'app.ts'); // Ensure this is your correct main file

// Function to create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Utility to prompt user for input
const askQuestion = (question: string): Promise<string> => {
  return new Promise((resolve) => rl.question(question, resolve));
};

// Function to create a file with content
const createFile = (filePath: string, content: string) => {
  if (fs.existsSync(filePath)) {
    console.log(`⚠️ File already exists: ${filePath}`);
  } else {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created: ${filePath}`);
  }
};

// Main script execution
(async () => {
  console.log('🚀 Adding new functionality to your app!\n');

  const featureName = await askQuestion('Enter the feature name (e.g., Task): ');
  const featureDesc = await askQuestion(`Enter a short description for ${featureName}: `);
  const featureLower = featureName.toLowerCase();
  const featureCamel = featureName.charAt(0).toLowerCase() + featureName.slice(1);
  const featureRouteFile = `${featureLower}.route.ts`;

  // Create Service
  const servicePath = path.join(SERVICES_DIR, `${featureLower}.service.ts`);
  const serviceContent = `import { Pool } from 'pg';

/**
 * TODO: Implement actual logic for ${featureName}
 * Description: ${featureDesc}
 */
export class ${featureName}Service {
  constructor(private pool: Pool) {}

  async getAll${featureName}s() {
    // TODO: Implement DB query
    return [];
  }
}
`;
  createFile(servicePath, serviceContent);

  // Create Service Controller
  const serviceControllerPath = path.join(CONTROLLER_SERVICES_DIR, `${featureLower}.controller.service.ts`);
  const serviceControllerContent = `import { Pool } from 'pg';
import { ${featureName}Service } from '../sqlite-services/${featureLower}.service';

/**
 * TODO: Implement middleware logic for ${featureName}
 * Description: ${featureDesc}
 */
export class ${featureName}ControllerService {
  private ${featureCamel}Service: ${featureName}Service;

  constructor(pool: Pool) {
    this.${featureCamel}Service = new ${featureName}Service(pool);
  }

  async get${featureName}s() {
    return await this.${featureCamel}Service.getAll${featureName}s();
  }
}
`;
  createFile(serviceControllerPath, serviceControllerContent);

  // Create Controller
  const controllerPath = path.join(CONTROLLERS_DIR, `${featureLower}.controller.ts`);
  const controllerContent = `import { Pool } from 'pg';
import { Request, Response } from 'express';
import { ${featureName}ControllerService } from '../services/core-services/${featureLower}.controller.service';
import { respond } from './controller.helper';

/**
 * TODO: Implement controller methods for ${featureName}
 * Description: ${featureDesc}
 */
export class ${featureName}Controller {
  private readonly ${featureCamel}Service: ${featureName}ControllerService;

  constructor(db: Pool) {
    this.${featureCamel}Service = new ${featureName}ControllerService(db);
  }

  async get${featureName}s(req: Request, res: Response) {
    try {
      const ${featureCamel}s = await this.${featureCamel}Service.get${featureName}s();
      if (!${featureCamel}s.length) return respond(res, 404, 'No ${featureName.toLowerCase()}s found.');
      return respond(res, 200, '${featureName}s retrieved successfully.', ${featureCamel}s);
    } catch (error) {
      return respond(res, 500, 'Failed to fetch ${featureName.toLowerCase()}s.', null, error);
    }
  }
}
`;
  createFile(controllerPath, controllerContent);

  // Create Route
  const routePath = path.join(ROUTES_DIR, featureRouteFile);
  const routeContent = `import { Router } from 'express';
import { ${featureName}Controller } from '../controllers/${featureLower}.controller';
import { getDb } from '../database/database';

const router = Router();
const db = getDb().getInstance();
const controller = new ${featureName}Controller(db);

/**
 * TODO: Implement API routes for ${featureName}
 * Description: ${featureDesc}
 */
router.get('/', async (req, res, next) => {
  try {
    await controller.get${featureName}s(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
`;
  createFile(routePath, routeContent);

  // Modify `createRoutes()` in `app.ts` to import the route dynamically
  let appContent = fs.readFileSync(APP_FILE, 'utf8');

  // Ensure the import line for the route exists in `createRoutes()`
  const importStatement = `const ${featureLower}Routes = (await import('./routes/${featureLower}.route')).default;`;
  const appUseStatement = `app.use('/${featureLower}s', ${featureLower}Routes);`;

  if (!appContent.includes(importStatement)) {
    const createRoutesMatch = appContent.match(/async function createRoutes\(\) \{([\s\S]*?)\}/);
    if (createRoutesMatch) {
      const updatedCreateRoutes = createRoutesMatch[0].replace(
        /\/\/ ✅ Attach routes after DB is initialized/,
        `// ✅ Attach routes after DB is initialized\n  ${importStatement}\n  ${appUseStatement}`
      );

      // Replace old `createRoutes()` with updated version
      appContent = appContent.replace(createRoutesMatch[0], updatedCreateRoutes);
    }
  }

  fs.writeFileSync(APP_FILE, appContent);
  console.log(`✅ Updated createRoutes() in app.ts with new route.`);

  console.log(`\n🎉 Feature '${featureName}' added successfully!`);
  console.log('📝 Don’t forget to complete TODOs in the generated files.');

  rl.close();
})();
