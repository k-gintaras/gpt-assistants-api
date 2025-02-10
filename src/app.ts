import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import { getDb } from './database/database';
import { generateApiDocs } from './generate-doc';
import { generateSwaggerPaths } from './swaggerHelper';
import { homePageHandler } from './homepage';
import cors from 'cors';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In your API server (e.g., Express.js server)

// Allow requests from your Angular app
app.use(
  cors({
    origin: 'http://localhost:4200', // Allow localhost:4200 to make requests
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Database initialization
async function startServer() {
  try {
    // Swagger setup
    const apiDocs = generateApiDocs();
    const swaggerPaths = generateSwaggerPaths(apiDocs);

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
      apis: ['./routes/*.ts', './controllers/*.ts'],
    };

    const swaggerSpec = swaggerJSDoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/', homePageHandler);

    await createRoutes();
    console.log('Routes Initialized: ');

    // Start server after DB is ready
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1); // Exit if DB fails to initialize
  }
}

// 🔥 Function to create and attach routes AFTER DB is ready
async function createRoutes() {
  const db = getDb();
  await db.initialize(); // Ensure DB is ready before starting server
  console.log('Database initialized successfully.');

  // ✅ Load routes only after DB is ready
  const assistantRoutes = (await import('./routes/assistant.routes')).default;
  const feedbackRoutes = (await import('./routes/feedback.routes')).default;
  const memoryExtraRoutes = (await import('./routes/memory-extra.routes')).default;
  const memoryFocusRuleRoutes = (await import('./routes/memory-focus-rule.routes')).default;
  const memoryFocusedRoutes = (await import('./routes/memory-focused.routes')).default;
  const memoryOwnedRoutes = (await import('./routes/memory-owned.routes')).default;
  const memoryRoutes = (await import('./routes/memory.routes')).default;
  const promptRoutes = (await import('./routes/prompt.routes')).default;
  const orchestratorRoutes = (await import('./routes/orchestrator.routes')).default;
  const relationshipGraphRoutes = (await import('./routes/relationship-graph.routes')).default;
  const tagExtraRoutes = (await import('./routes/tag-extra.routes')).default;
  const tagRoutes = (await import('./routes/tag.routes')).default;
  const taskRoutes = (await import('./routes/task.routes')).default;
  const backupRoutes = (await import('./routes/backup.routes')).default;

  // ✅ Attach routes after DB is initialized
  app.use('/backup', backupRoutes);
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
}

startServer();
