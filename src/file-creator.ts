/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs';
import * as path from 'path';
import { generateApiDocs } from './generate-doc';
import { generateSwaggerPaths } from './swaggerHelper';

export function createFile(f: string, data: any) {
  const outputFilePath = path.join(__dirname, f);
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2));
}

export function createSwaggerDoc() {
  const f1 = 'json-docs.json';

  const f2 = 'swagger-docs.json';
  const apiDocs = generateApiDocs();
  const swaggerPaths = generateSwaggerPaths(apiDocs);

  createFile(f1, apiDocs);
  createFile(f2, swaggerPaths);
}

createSwaggerDoc();
