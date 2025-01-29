import { getDbInstance } from '../../../database/database';
import request from 'supertest';
import express from 'express';
import { insertHelpers } from '../test-db-insert.helper'; // Assuming helper is implemented
import Database from 'better-sqlite3';
import { testDbHelper } from '../test-db.helper';
import taskRoutes from '../../../routes/task.routes';

let db: Database.Database;
const app = express();
app.use(express.json());
app.use('/tasks', taskRoutes); // Register task routes

beforeAll(() => {
  db = getDbInstance();

  testDbHelper.initializeTarget(db);
  insertHelpers.insertAssistant(db, '1');
  insertHelpers.insertTags(db);
  insertHelpers.insertTask(db, '1', 'Test Task 1', '1', 'pending'); // Insert a task with the appropriate values
});

beforeEach(() => {
  testDbHelper.initializeTarget(db);
  insertHelpers.insertAssistant(db, '1');
  insertHelpers.insertTags(db);
  insertHelpers.insertTask(db, '1', 'Test Task 1', '1', 'pending'); // Insert a task with the appropriate values
});

afterAll(() => {
  db.close(); // Close the database connection after tests
});

describe('Task Controller Tests', () => {
  it('should fetch a task by ID', async () => {
    const taskId = '1'; // Replace with valid task ID

    const response = await request(app).get(`/tasks/${taskId}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.id).toBe(taskId);
  });

  it('should fetch all tasks', async () => {
    const response = await request(app).get('/tasks');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should create a new task', async () => {
    const newTask = {
      description: 'Test task description',
      status: 'pending',
      id: '',
      assignedAssistant: '1',
    };

    const response = await request(app).post('/tasks').send(newTask);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Task created successfully.');
    expect(response.body.data).toHaveProperty('id');
  });

  it('should update a task', async () => {
    const updatedTask = {
      title: 'Updated Task',
      description: 'Updated task description',
      status: 'in_progress',
    };

    const taskId = '1'; // Assuming task ID '1' exists
    const response = await request(app).put(`/tasks/${taskId}`).send(updatedTask);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task updated successfully.');
  });

  it('should return 500 when updating a non-existent task', async () => {
    const updatedTask = {
      title: 'Updated Task',
      description: 'Updated task description',
      status: 'in_progress',
    };

    const response = await request(app).put('/tasks/999').send(updatedTask); // Non-existent task ID
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Failed to update task.');
  });

  it('should delete a task', async () => {
    const taskId = '1'; // Assuming task ID '1'
    const response = await request(app).delete(`/tasks/${taskId}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task deleted successfully.');
  });

  it('should return 404 for deleting a non-existent task', async () => {
    const response = await request(app).delete('/tasks/999'); // Non-existent task ID
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Task with ID 999 not found or delete failed.');
  });

  it('should fetch tasks by status', async () => {
    const status = 'pending'; // Replace with valid status

    const response = await request(app).get(`/tasks/status/${status}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should fetch tasks by assistant ID', async () => {
    const assistantId = '1'; // Replace with valid assistant ID

    const response = await request(app).get(`/tasks/assistant/${assistantId}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});
