import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import assistantRoutes from './routes/assistant.routes';
import feedbackRoutes from './routes/feedback.routes';
import memoryExtraRoutes from './routes/memory-extra.routes';
import memoryFocusRuleRoutes from './routes/memory-focus-rule.routes';
import memoryFocusedRoutes from './routes/memory-focused.routes';
import memoryOwnedRoutes from './routes/memory-owned.routes';
import memoryRoutes from './routes/memory.routes';
import promptRoutes from './routes/prompt.routes';
import orchestratorRoutes from './routes/orchestrator.routes';
import relationshipGraphRoutes from './routes/relationship-graph.routes';
import tagExtraRoutes from './routes/tag-extra.routes';
import tagRoutes from './routes/tag.routes';
import taskRoutes from './routes/task.routes';

// Import the generated apiDocs from your previous code
import { generateApiDocs } from './generate-doc';
import { generateSwaggerPaths } from './swaggerHelper'; // Import the new helper
import { initializeDatabase } from './database/init';
import dotenv from 'dotenv';

const app = express();
const PORT = 3000;

dotenv.config(); // Load environment variables

// Generate Swagger paths dynamically from apiDocs
initializeDatabase();

const apiDocs = generateApiDocs();
const swaggerPaths = generateSwaggerPaths(apiDocs);

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for my application',
    },
    paths: swaggerPaths, // Use dynamically generated paths
  },
  apis: ['./routes/*.ts', './controllers/*.ts'], // Path to your route and controller files
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());

// Routes
app.use('/orchestrator', orchestratorRoutes);
app.use('/assistant', assistantRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/memory-extra', memoryExtraRoutes);
app.use('/memory-focus-rule', memoryFocusRuleRoutes);
app.use('/memory-focused', memoryFocusedRoutes);
app.use('/memory-owned', memoryOwnedRoutes);
app.use('/memory', memoryRoutes);
app.use('/prompt', promptRoutes);
app.use('/relationship-graph', relationshipGraphRoutes);
app.use('/tag-extra', tagExtraRoutes);
app.use('/tag', tagRoutes);
app.use('/task', taskRoutes);

// Start Server
// app.listen(PORT, () => {
//   console.log(`Server is running at http://localhost:${PORT}`);
// });
// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
