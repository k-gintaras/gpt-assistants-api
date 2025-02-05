import { getDb } from '../test-db.helper';
import { Task } from '../../../models/task.model';
import { Pool } from 'pg';
import { TaskService } from '../../../services/sqlite-services/task.service';
import { insertHelpers } from '../test-db-insert.helper';

let taskService: TaskService;
let db: Pool;
const tId = 'taskServiceId';
beforeAll(async () => {
  await getDb.initialize();
  db = getDb.getInstance();
  taskService = new TaskService(db);
});

beforeEach(async () => {
  await db.query('BEGIN'); // Start transaction for each test
  await insertHelpers.insertAssistant(db, tId + 'assistant1'); // Assistant 1
  await insertHelpers.insertAssistant(db, tId + 'assistant2'); // Assistant 2
  await insertHelpers.insertAssistant(db, tId + 'assistant3'); // Assistant 3
  await insertHelpers.insertAssistant(db, tId + 'assistant4'); // Assistant 4
  await insertHelpers.insertAssistant(db, tId + 'assistant5'); // Assistant 5
  await insertHelpers.insertAssistant(db, tId + 'assistant6'); // Assistant 5
  await insertHelpers.insertAssistant(db, tId + 'assistant7'); // Assistant 5
});

afterEach(async () => {
  await db.query('ROLLBACK'); // Rollback changes after each test
});

afterAll(async () => {
  await getDb.close();
});

describe('Task Service', () => {
  it('should add a new task', async () => {
    const data = { key: 'value' };
    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      description: 'Test Task',
      assignedAssistant: tId + 'assistant1',
      status: 'pending',
      inputData: JSON.stringify(data), // Pass the object directly, not stringified
      outputData: null,
    };

    const taskId = await taskService.addTask(taskData);
    expect(taskId).toBeDefined();

    const task = await taskService.getTaskById(taskId);
    expect(task).not.toBeNull();
    expect(task?.description).toBe('Test Task');
    expect(task?.assignedAssistant).toBe(tId + 'assistant1');
    expect(task?.status).toBe('pending');
    expect(task?.inputData).toEqual(data); // Directly compare as objects
    expect(task?.outputData).toBeNull();
  });

  it('should update an existing task', async () => {
    const data = { result: 'success' };
    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      description: 'Update Test Task',
      assignedAssistant: tId + 'assistant2',
      status: 'pending',
    };

    const taskId = await taskService.addTask(taskData);

    const updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>> = {
      status: 'in_progress',
      outputData: JSON.stringify(data), // Ensure it's passed as a stringified JSON object
    };

    const updated = await taskService.updateTask(taskId, updates);
    expect(updated).toBe(true);

    const updatedTask = await taskService.getTaskById(taskId);
    expect(updatedTask?.status).toBe('in_progress');
    expect(updatedTask?.outputData).toStrictEqual(data); // Use toStrictEqual for deep equality
  });

  it('should delete a task', async () => {
    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      description: 'Delete Test Task',
      assignedAssistant: tId + 'assistant3',
      status: 'pending',
    };

    const taskId = await taskService.addTask(taskData);

    const deleted = await taskService.deleteTask(taskId);
    expect(deleted).toBe(true);

    const deletedTask = await taskService.getTaskById(taskId);
    expect(deletedTask).toBeNull();
  });

  it('should fetch tasks by status', async () => {
    await taskService.addTask({
      description: 'Pending Task',
      assignedAssistant: tId + 'assistant4',
      status: 'pending',
    });
    await taskService.addTask({
      description: 'Completed Task',
      assignedAssistant: tId + 'assistant5',
      status: 'completed',
    });

    const pendingTasks = await taskService.getTasksByStatus('pending');
    expect(pendingTasks.length).toBeGreaterThanOrEqual(1);
    expect(pendingTasks.every((task) => task.status === 'pending')).toBe(true);
  });

  it('should fetch tasks assigned to a specific assistant', async () => {
    await taskService.addTask({
      description: 'Task for Assistant 6',
      assignedAssistant: tId + 'assistant6',
      status: 'pending',
    });
    await taskService.addTask({
      description: 'Task for Assistant 7',
      assignedAssistant: tId + 'assistant7',
      status: 'pending',
    });

    const assistant6Tasks = await taskService.getTasksByAssistant(tId + 'assistant6');
    expect(assistant6Tasks.length).toBe(1);
    expect(assistant6Tasks[0].assignedAssistant).toBe(tId + 'assistant6');
  });

  it('should throw an error when updating a non-existent task', async () => {
    const updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>> = {
      status: 'completed',
    };

    await expect(taskService.updateTask('nonexistent-task', updates)).rejects.toThrow('Task with ID nonexistent-task not found.');
  });

  it('should return false when deleting a non-existent task', async () => {
    const deleted = await taskService.deleteTask('nonexistent-task');
    expect(deleted).toBe(false);
  });
});
