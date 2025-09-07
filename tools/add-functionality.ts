#!/usr/bin/env ts-node
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: ts-node tools/add-feature.ts <FeatureName>");
  process.exit(1);
}

const raw = args[0];

const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();

const pascal = (s: string) =>
  s
    .replace(/(^\w|[-_ ]\w)/g, (m) => m.replace(/[-_ ]/, "").toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");

const titleCase = (s: string) =>
  s
    .replace(/(^\w|[-_ ]\w)/g, (m) => m.replace(/[-_ ]/, " ").toUpperCase())
    .trim();

const featureKebab = kebab(raw);
const FeaturePascal = pascal(raw);
const FeatureTitle = titleCase(raw);

const projectRoot = path.resolve(__dirname, "..");
const featuresDir = path.join(projectRoot, "src", "features");
const targetDir = path.join(featuresDir, featureKebab);

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeIfMissing(filePath: string, content: string) {
  if (fs.existsSync(filePath)) {
    console.log(`⚠️ Skipping (exists): ${path.relative(projectRoot, filePath)}`);
    return;
  }
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, { encoding: "utf8" });
  console.log(`✅ Created: ${path.relative(projectRoot, filePath)}`);
}

// Templates
const controllerTs = `import { Get, Route, Tags } from "tsoa";
import { ${FeaturePascal}Service } from "./${featureKebab}.service";

@Route("${featureKebab}")
@Tags("${FeatureTitle}")
export class ${FeaturePascal}Controller {
  private svc = new ${FeaturePascal}Service();

  /**
   * TODO: adjust return type and logic
   */
  @Get("/")
  public async getAll(): Promise<any[]> {
    return this.svc.getAll();
  }
}
`;

const serviceTs = `/**
 * TODO: implement real database logic using Pool from pg
 */
export class ${FeaturePascal}Service {
  private items = [
    { id: "1", name: "First ${FeatureTitle}" },
    { id: "2", name: "Second ${FeatureTitle}" }
  ];

  async getAll() {
    return this.items;
  }
}
`;

const testTs = `import { ${FeaturePascal}Service } from "../${featureKebab}.service";

describe("${FeaturePascal}Service", () => {
  it("should return an array from getAll()", async () => {
    const svc = new ${FeaturePascal}Service();
    const items = await svc.getAll();
    expect(Array.isArray(items)).toBe(true);
    // TODO: add more meaningful tests
  });
});
`;

// Create files
ensureDir(featuresDir);
if (fs.existsSync(targetDir)) {
  console.error(
    `❌ Feature folder already exists: ${path.relative(
      projectRoot,
      targetDir
    )}`
  );
  process.exit(1);
}

writeIfMissing(
  path.join(targetDir, `${featureKebab}.controller.ts`),
  controllerTs
);
writeIfMissing(path.join(targetDir, `${featureKebab}.service.ts`), serviceTs);
writeIfMissing(
  path.join(targetDir, "tests", `${featureKebab}.spec.ts`),
  testTs
);

console.log(`\n🎉 Feature scaffold created at src/features/${featureKebab}`);
console.log("➡️ Run: npm run tsoa:gen to update routes and swagger.");
