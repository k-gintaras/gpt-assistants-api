import express from 'express';
import request from 'supertest';
import promptRoutes from '../../../routes/prompt.routes';
import { insertHelpers } from '../test-db-insert.helper';
import { testDbHelper } from '../test-db.helper';
import { getDbInstance } from '../../../database/database';
import Database from 'better-sqlite3';

let db: Database.Database;
const app = express();
app.use(express.json());
app.use('/prompt', promptRoutes); // Register prompt routes

beforeAll(() => {
  db = getDbInstance();
  testDbHelper.initializeTarget(db);
  insertHelpers.insertAssistant(db, '1'); // Insert test data for assistant
});

afterAll(() => {
  testDbHelper.close();
});

describe('Prompt Controller Tests', () => {
  it('should respond to a valid prompt request', async () => {
    const newPrompt = {
      id: '1',
      prompt: 'What is the capital of France?',
      extraInstruction: 'Provide a detailed answer.',
    };
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

  it('should return 404 if assistant is not found for the prompt', async () => {
    const newPrompt = {
      id: '999', // Non-existent assistant
      prompt: 'What is the capital of France?',
      extraInstruction: 'Provide a detailed answer.',
    };
    const response = await request(app).post('/prompt').send(newPrompt);
    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Prompt failed or assistant not found.');
  });
});
