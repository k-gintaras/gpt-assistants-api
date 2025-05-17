import express from 'express';
import request from 'supertest';
import promptRoutes from '../../../routes/prompt.routes';
import { Pool } from 'pg'; // Use Pool for PostgreSQL
import { getDb } from '../../../database/database';
import { insertHelpers } from '../test-db-insert.helper';

let db: Pool;
const app = express();
app.use(express.json());
app.use('/prompt', promptRoutes); // Register prompt routes

const uniqueIdPrefix = 'promptRoutesTest_'; // Unique identifier prefix for testing

beforeAll(async () => {
  await getDb().initialize();
  db = getDb().getInstance();
});

beforeEach(async () => {
  await db.query('BEGIN'); // Begin transaction before each test
  const id = uniqueIdPrefix + 'assistant' + 3;
  await insertHelpers.insertAssistant(db, id);
});

afterEach(async () => {
  await db.query('ROLLBACK'); // Rollback changes after each test
});

afterAll(async () => {
  await getDb().close(); // Clean up the test database after tests
});

describe('Prompt Controller Tests', () => {
  it('should respond to a valid prompt request', async () => {
    const id = uniqueIdPrefix + 'assistant' + 3;
    await insertHelpers.insertAssistant(db, id);
    const newPrompt = {
      id: uniqueIdPrefix + 'assistant' + 3,
      prompt: 'What is the capital of France?',
      extraInstruction: 'Provide a detailed answer.',
    };
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve(newPrompt);
      }, 1000); // Log the response after a delay
    });

    await promise; // Wait for the promise to resolve

    const response = await request(app).post('/prompt').send(newPrompt);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Prompt processed successfully');
    expect(typeof response.body.data).toBe('string'); // Check if data is a string
  });

  it('should return 400 for invalid prompt request', async () => {
    const invalidPrompt = {};
    const response = await request(app).post('/prompt').send(invalidPrompt);
    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Prompt failed or assistant not found.');
  });

  it('should return 400 if assistant is not found for the prompt', async () => {
    const newPrompt = {
      id: uniqueIdPrefix + '999', // Non-existent assistant
      prompt: 'What is the capital of France?',
      extraInstruction: 'Provide a detailed answer.',
    };
    const response = await request(app).post('/prompt').send(newPrompt);
    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Prompt failed or assistant not found.');
  });
});
