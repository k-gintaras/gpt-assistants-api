/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import { generateApiDocs } from './generate-doc';
import { generateSwaggerPaths } from './swaggerHelper';

function getRandomName(): string {
  const names = ['Echo', 'Nova', 'Astra', 'Orion', 'Atlas', 'Sol'];
  return names[Math.floor(Math.random() * names.length)] + '-' + Math.floor(Math.random() * 1000);
}

import { OpenAPIV3 } from 'openapi-types';

// ✅ Safe extraction of GET requests for generating links
export const generateGetLinks = (swaggerPaths: OpenAPIV3.PathsObject): string => {
  return Object.keys(swaggerPaths)
    .filter((path) => swaggerPaths[path]?.get) // Ensure `get` exists before accessing
    .map((path) => `<li><a href="${path}" target="_blank">${path}</a></li>`)
    .join('');
};

export function getRequestParams(apiDocs: any[]) {
  /**
    "file": "assistant.routes.ts",
    "httpMethod": "get",
    "path": "/assistant/",
    "controller": "assistant.controller",
    "method": "getAllAssistants",
    "requestParams": null,
    "requestBody": null,
    "responses": [
     */

  const params: string[] = [];
  for (let i = 0; i < apiDocs.length; i++) {
    const d = apiDocs[i];
    if (d) {
      try {
        const ob = `${d.httpMethod || ''} ": " ${d.path || ''} "requestParams: "${d.requestParams || ''}  requestBody: ${d.requestBody || ''}`;
        params.push(ob);
      } catch {
        continue;
      }
    }
  }
  return params;
}

export function homePageHandler(req: Request, res: Response) {
  // Read SQL schema from file
  const sqlFilePath = path.join(__dirname, 'database', 'pg-tables.sql');
  let sqlSchema = '';

  try {
    sqlSchema = fs.readFileSync(sqlFilePath, 'utf-8');
    sqlSchema = Prism.highlight(sqlSchema, Prism.languages.sql, 'sql');
  } catch (error) {
    console.error('Error reading SQL file:', error);
    sqlSchema = '<p style="color:red;">Error loading SQL schema.</p>';
  }

  // Fetch API routes
  const apiDocs = generateApiDocs();
  const swaggerPaths = generateSwaggerPaths(apiDocs);

  // Extract GET requests for quick access
  const getLinks = generateGetLinks(swaggerPaths);

  // Preset JSON examples for `POST` requests
  const examplePostRequests = [
    {
      title: 'Create Simple Assistant',
      endpoint: '/assistant/simple',
      payload: {
        name: getRandomName(),
        instructions: 'This assistant helps with simple tasks.',
      },
    },
    {
      title: 'Create Assistant',
      endpoint: '/assistant',
      payload: {
        name: getRandomName(),
        type: 'general',
        model: 'gpt-4o',
        instructions: 'Provide assistance with technical queries.',
      },
    },
    {
      title: 'Send Prompt',
      endpoint: '/prompt',
      payload: {
        id: `prompt-${Math.floor(Math.random() * 10000)}`,
        prompt: 'How do I optimize my database queries?',
        extraInstruction: 'Provide a SQL-optimized solution.',
      },
    },
  ];

  const postExamples = examplePostRequests
    .map(
      (req) => `
      <h3>${req.title}</h3>
      <p><strong>Endpoint:</strong> <span class="code">${req.endpoint}</span></p>
      <pre><code class="language-json">${JSON.stringify(req.payload, null, 2)}</code></pre>
      <!--<button onclick="sendPost('${req.endpoint}', ${JSON.stringify(req.payload)})">Try It</button>-->
    `
    )
    .join('');

  // Allowed Models
  const allowedModels = ['gpt-4-turbo-preview', 'gpt-4o', 'gpt-4', 'gpt-3.5-turbo-16k', 'gpt-4-turbo-2024-04-09', 'gpt-4-turbo', 'gpt-4o-mini', 'o1-mini', 'gpt-3.5-turbo']
    .map((model) => `<li>${model}</li>`)
    .join('');

  // HTML page
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Home</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #007bff; }
        ul { list-style: none; padding: 0; }
        li { margin: 10px 0; }
        a { text-decoration: none; color: #007bff; font-weight: bold; }
        .code { font-family: monospace; background: #f4f4f4; padding: 5px; border-radius: 5px; }
        pre { background: #282c34; padding: 10px; border-radius: 5px; overflow-x: auto; color: #abb2bf; }
        code { color: #abb2bf; }
        button { margin-top: 5px; padding: 5px 10px; background: #007bff; color: #fff; border: none; cursor: pointer; border-radius: 3px; }
        button:hover { background: #0056b3; }
      </style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
      <script>
        async function sendPost(endpoint, payload) {
          try {
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const result = await response.json();
            alert('Response: ' + JSON.stringify(result, null, 2));
          } catch (error) {
            alert('Error: ' + error);
          }
        }
      </script>
    </head>
    <body>
      <h1>API Home</h1>
      <p>Welcome to the API. Here are some useful links and details:</p>

      <h2>📜 API Docs</h2>
      <ul>
        <li><a href="/api-docs" target="_blank">Swagger Documentation</a></li>
      </ul>

      <h2>🧠 Allowed Models</h2>
      <ul>${allowedModels}</ul>

      <h2>📌 Example POST Requests</h2>
      ${postExamples}

      <h2>🔗 Quick GET Requests</h2>
      <ul>${getLinks}</ul>

      <h2>📂 Database Schema</h2>
      <pre><code class="language-sql">${sqlSchema}</code></pre>

      <h2>💡 Quick Usage</h2>
      <p>Use tools like <strong>Postman</strong> or <strong>cURL</strong> to interact with the API:</p>
      <pre><code class="language-bash">curl -X GET http://localhost:3000/assistant</code></pre>
      <pre>${JSON.stringify(getRequestParams(apiDocs), null, 2)}</pre>
      <pre>${JSON.stringify(apiDocs, null, 2)}</pre>
    </body>
    </html>
  `;

  res.send(html);
}
