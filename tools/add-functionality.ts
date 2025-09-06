#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Minimal CLI: node tools/add-functionality.js <FeatureName>
// Creates: src/features/<kebab-name>/{index.ts, <kebab>.controller.ts, <kebab>.service.ts, tests/<kebab>.spec.ts}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node tools/add-functionality.js <FeatureName>');
  process.exit(1);
}

const raw = args[0];

const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase();

const pascal = (s: string) =>
  s
    .replace(/(^\w|[-_ ]\w)/g, (m) => m.replace(/[-_ ]/, '').toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');

const titleCase = (s: string) =>
  s
    .replace(/(^\w|[-_ ]\w)/g, (m) => m.replace(/[-_ ]/, ' ').toUpperCase())
    .trim();

const featureKebab = kebab(raw);
const FeaturePascal = pascal(raw);
const FeatureTitle = titleCase(raw);

const projectRoot = path.resolve(__dirname, '..');
const featuresDir = path.join(projectRoot, 'src', 'features');
const targetDir = path.join(featuresDir, featureKebab);

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeIfMissing(filePath: string, content: string) {
  if (fs.existsSync(filePath)) {
    console.log(`Skipping (exists): ${path.relative(projectRoot, filePath)}`);
    return;
  }
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  console.log(`Created: ${path.relative(projectRoot, filePath)}`);
}

// Templates
const indexTs = `import { Router } from "express";
import type { Express } from "express";
import { ${FeaturePascal}Controller } from "./${featureKebab}.controller";

/**
 * @swagger
 * tags:
 *   - name: ${FeatureTitle}
 *     description: ${FeatureTitle} endpoints
 */

export default {
  name: "${featureKebab}",

  registerRoutes(app: Express) {
    const router = Router();
    const controller = new ${FeaturePascal}Controller();

    /**
     * @swagger
     * /${featureKebab}:
     *   get:
     *     summary: List all ${featureKebab}
     *     tags: [${FeatureTitle}]
     *     responses:
     *       200:
     *         description: Array of items
     */
    router.get('/', (req, res) => controller.getList(req, res));

    router.get('/:id', (req, res) => controller.getOne(req, res));

    app.use(`/${this.name}`, router);
  },
};
`;

const controllerTs = `import { Request, Response } from "express";
import { ${FeaturePascal}Service } from "./${featureKebab}.service";

export class ${FeaturePascal}Controller {
  private svc = new ${FeaturePascal}Service();

  async getList(req: Request, res: Response) {
    const items = await this.svc.getAll();
    res.json(items);
  }

  async getOne(req: Request, res: Response) {
    const item = await this.svc.getById(req.params.id);
    if (item) res.json(item);
    else res.status(404).json({ error: 'Not found' });
  }
}
`;

const serviceTs = `export class ${FeaturePascal}Service {
  private items = [
    { id: '1', name: 'First ${FeatureTitle}' },
    { id: '2', name: 'Second ${FeatureTitle}' },
  ];

  async getAll() {
    return this.items;
  }

  async getById(id: string) {
    return this.items.find(i => i.id === id) || null;
  }
}
`;

const testTs = `import { ${FeaturePascal}Service } from '../${featureKebab}.service';

describe('${FeaturePascal}Service', () => {
  it('returns an array from getAll', async () => {
    const svc = new ${FeaturePascal}Service();
    const items = await svc.getAll();
    expect(Array.isArray(items)).toBe(true);
  });
});
`;

// Create files
ensureDir(featuresDir);
if (fs.existsSync(targetDir)) {
  console.error(`Feature folder already exists: ${path.relative(projectRoot, targetDir)}`);
  process.exit(1);
}

writeIfMissing(path.join(targetDir, 'index.ts'), indexTs);
writeIfMissing(path.join(targetDir, `${featureKebab}.controller.ts`), controllerTs);
writeIfMissing(path.join(targetDir, `${featureKebab}.service.ts`), serviceTs);
writeIfMissing(path.join(targetDir, 'tests', `${featureKebab}.spec.ts`), testTs);

console.log(`\nDone. Feature scaffold created at src/features/${featureKebab}`);
console.log('Notes: The script will NOT modify src/app.ts. The app auto-loads features from src/features/ by design.');
import * as fs from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const FEATURES_DIR = path.join(__dirname, '../src/features');
const APP_FILE = path.join(__dirname, '../src/app.ts');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string) => new Promise<string>((res) => rl.question(q, res));

const ensureDir = (p: string) => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };
const write = (file: string, content: string) => { ensureDir(path.dirname(file)); fs.writeFileSync(file, content); console.log(`✅ ${file}`); };

(async () => {
  console.log('🚀 Feature scaffolder');
  const raw = (await ask('Feature name (e.g., ConversationOrchestrator): ')).trim();
  if (!raw) { console.log('Aborted'); rl.close(); return; }
  const featureName = raw.charAt(0).toUpperCase() + raw.slice(1);
  const featureLower = featureName.replace(/([A-Z])/g, '-$1').replace(/^-/, '').toLowerCase().replace(/--+/g, '-');
  const desc = (await ask('Short description (optional): ')).trim();

  const dir = path.join(FEATURES_DIR, featureLower);
  ensureDir(dir);

  const service = `import { Pool } from 'pg';\n\n/** Service: ${featureName}\n * ${desc}\n */\nexport class ${featureName}Service {\n  constructor(private pool: Pool) {}\n  async getAll() { return [] as any[]; }\n}\n`;
  const core = `import { Pool } from 'pg';\nimport { ${featureName}Service } from './${featureLower}.service';\n\nexport class ${featureName}ControllerService {\n  private svc: ${featureName}Service;\n  constructor(pool: Pool) { this.svc = new ${featureName}Service(pool); }\n  async list() { return this.svc.getAll(); }\n}\n`;
  const controller = `import { Request, Response } from 'express';\nimport { ${featureName}ControllerService } from './${featureLower}.controller.service';\nimport { getDb } from '../../database/database';\nimport { respond } from '../../controllers/controller.helper';\n\nexport class ${featureName}Controller {\n  private readonly svc: ${featureName}ControllerService;\n  constructor() { const db = getDb().getInstance(); this.svc = new ${featureName}ControllerService(db); }\n  async getList(req: Request, res: Response) { try { const items = await this.svc.list(); return respond(res, 200, '${featureName} list', items); } catch (err) { return respond(res, 500, 'Failed', null, err); } }\n}\n`;
  const routes = `import { Router } from 'express';\nimport { ${featureName}Controller } from './${featureLower}.controller';\n\nconst router = Router();\nconst controller = new ${featureName}Controller();\nrouter.get('/', async (req, res, next) => { try { await controller.getList(req, res); } catch (err) { next(err); } });\nexport default router;\n`;
  const types = `export interface StartRequest { conversationId: string; userId: string; options?: Record<string, any>; }\nexport interface StartResponse { jobId: string; status: 'pending'|'running'|'done'|'failed'; }\n`;
  const test = `import request from 'supertest';\nimport app from '../../../src/app';\n\ndescribe('${featureName} routes', () => { it('GET /', async () => { const res = await request(app).get('/${featureLower}'); expect([200,404,500]).toContain(res.status); }); });\n`;

  write(path.join(dir, `${featureLower}.service.ts`), service);
  write(path.join(dir, `${featureLower}.controller.service.ts`), core);
  write(path.join(dir, `${featureLower}.controller.ts`), controller);
  write(path.join(dir, `${featureLower}.routes.ts`), routes);
  write(path.join(dir, `${featureLower}.types.ts`), types);
  write(path.join(dir, 'tests', `${featureLower}.spec.ts`), test);

  // Try to update app.ts (best-effort)
  try {
    const appText = fs.readFileSync(APP_FILE, 'utf8');
    const importLine = `const ${featureLower}Routes = (await import('./features/${featureLower}/${featureLower}.routes')).default;`;
    const useLine = `  app.use('/${featureLower}', ${featureLower}Routes);`;
    if (!appText.includes(importLine)) {
      const match = appText.match(/async function createRoutes\(\) \{([\s\S]*?)\}/);
      if (match) {
        const replaced = match[0].replace(/\/\/ ✅ Attach routes after DB is initialized/, `// ✅ Attach routes after DB is initialized\n  ${importLine}\n${useLine}`);
        fs.writeFileSync(APP_FILE, appText.replace(match[0], replaced));
        console.log(`✅ Updated app.ts to mount /${featureLower}`);
      } else console.log('⚠️ createRoutes() not found in app.ts — manual update required');
    }
  } catch (e) { console.log('⚠️ Could not update app.ts automatically:', (e as Error).message); }

  console.log(`\n🎉 Scaffold created at ${dir}`);
  rl.close();
})();
    }
  }
}
`;

  const routesContent = `import { Router } from 'express';
import { ${featureName}Controller } from './${featureLower}.controller';

const router = Router();
const controller = new ${featureName}Controller();

/**
 * Routes for ${featureName}
 */
router.get('/', async (req, res, next) => {
  try {
    await controller.getList(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;
`;

  const typesContent = `/** Types for ${featureName} */
export interface StartRequest {
  conversationId: string;
  userId: string;
  options?: Record<string, any>;
}

export interface StartResponse {
  jobId: string;
  status: 'pending' | 'running' | 'done' | 'failed';
}
`;

  const testContent = `import request from 'supertest';
import app from '../../../src/app';

describe('${featureName} routes', () => {
  it('GET / should return 200 or delegate to controller', async () => {
    const res = await request(app).get('/${featureLower}');
    // adapt assertion depending on app state
    expect([200, 404, 500]).toContain(res.status);
  });
});
`;

  // Create files
  createFile(servicePath, serviceContent);
  createFile(coreServicePath, coreServiceContent);
  createFile(controllerPath, controllerContent);
  createFile(routesPath, routesContent);
  createFile(typesPath, typesContent);
  createFile(testPath, testContent);

  // Update app.ts to dynamically import the feature route inside createRoutes()
  try {
    let appContent = fs.readFileSync(APP_FILE, 'utf8');
    const importStatement = `const ${featureCamel}Routes = (await import('./features/${featureLower}/${featureLower}.routes')).default;`;
    const appUseStatement = `  app.use('/${featureLower}', ${featureCamel}Routes);`;

    if (!appContent.includes(importStatement)) {
      const createRoutesMatch = appContent.match(/async function createRoutes\(\) \{([\s\S]*?)\}/);
      if (createRoutesMatch) {
        const updatedCreateRoutes = createRoutesMatch[0].replace(
          /\/\/ ✅ Attach routes after DB is initialized/,
          `// ✅ Attach routes after DB is initialized\n  ${importStatement}\n${appUseStatement}`
        );
        appContent = appContent.replace(createRoutesMatch[0], updatedCreateRoutes);
        fs.writeFileSync(APP_FILE, appContent);
        console.log(`✅ Updated createRoutes() in app.ts to mount /${featureLower}`);
      } else {
        console.log('⚠️ Could not find createRoutes() in app.ts — skipping automatic app.ts update.');
      }
    } else {
      console.log('ℹ️ app.ts already contains import for this route — no change made.');
    }
  } catch (err) {
    console.log('⚠️ Warning: failed to update app.ts automatically:', (err as Error).message);
  }

  console.log(`\n🎉 Feature '${featureName}' scaffolded at ${featureDir}`);
  console.log('📝 Review the generated files and complete TODOs where needed.');

  rl.close();
})();
