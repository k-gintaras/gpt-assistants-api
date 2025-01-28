import Database from 'better-sqlite3';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../services/sqlite-services/task.service';
let taskService: TaskService;
describe('Task Service', () => {
  beforeAll(() => {
    const db = new Database(':memory:');
    // Initialize tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        assignedAssistant TEXT NOT NULL,
        status TEXT CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')) NOT NULL,
        inputData TEXT,
        outputData TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
    taskService = new TaskService(db);
  });

  afterAll(() => {
    taskService.db.close();
  });

  it('should add a new task', async () => {
    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      description: 'Test Task',
      assignedAssistant: 'assistant1',
      status: 'pending',
      inputData: { key: 'value' },
      outputData: undefined,
    };

    const taskId = await taskService.addTask(taskData);
    expect(taskId).toBeDefined();

    const task = taskService.getTaskById(taskId);
    expect(task).not.toBeNull();
    expect(task?.description).toBe('Test Task');
    expect(task?.assignedAssistant).toBe('assistant1');
    expect(task?.status).toBe('pending');
    expect(task?.inputData).toEqual({ key: 'value' });
    expect(task?.outputData).toBeNull();
  });

  it('should update an existing task', async () => {
    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      description: 'Update Test Task',
      assignedAssistant: 'assistant2',
      status: 'pending',
    };

    const taskId = await taskService.addTask(taskData);

    const updates: Task = {
      status: 'in_progress',
      outputData: { result: 'success' },
      id: '',
      description: '',
      assignedAssistant: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updated = await taskService.updateTask(taskId, updates);
    expect(updated).toBe(true);

    const updatedTask = taskService.getTaskById(taskId);
    expect(updatedTask?.status).toBe('in_progress');
    expect(updatedTask?.outputData).toEqual({ result: 'success' });
  });

  it('should delete a task', async () => {
    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      description: 'Delete Test Task',
      assignedAssistant: 'assistant3',
      status: 'pending',
    };

    const taskId = await taskService.addTask(taskData);

    const deleted = await taskService.deleteTask(taskId);
    expect(deleted).toBe(true);

    const deletedTask = taskService.getTaskById(taskId);
    expect(deletedTask).toBeNull();
  });

  it('should fetch tasks by status', async () => {
    // Add multiple tasks
    await taskService.addTask({
      description: 'Pending Task',
      assignedAssistant: 'assistant4',
      status: 'pending',
    });
    await taskService.addTask({
      description: 'Completed Task',
      assignedAssistant: 'assistant5',
      status: 'completed',
    });

    const pendingTasks = taskService.getTasksByStatus('pending');
    expect(pendingTasks.length).toBeGreaterThanOrEqual(1);
    expect(pendingTasks.every((task) => task.status === 'pending')).toBe(true);
  });

  it('should fetch tasks assigned to a specific assistant', async () => {
    // Add tasks for different assistants
    await taskService.addTask({
      description: 'Task for Assistant 6',
      assignedAssistant: 'assistant6',
      status: 'pending',
    });
    await taskService.addTask({
      description: 'Task for Assistant 7',
      assignedAssistant: 'assistant7',
      status: 'pending',
    });

    const assistant6Tasks = taskService.getTasksByAssistant('assistant6');
    expect(assistant6Tasks.length).toBe(1);
    expect(assistant6Tasks[0].assignedAssistant).toBe('assistant6');
  });

  it('should throw an error when updating a non-existent task', async () => {
    const updates: Task = {
      status: 'completed',
      id: '',
      description: '',
      assignedAssistant: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await expect(taskService.updateTask('nonexistent-task', updates)).rejects.toThrow('Task with ID nonexistent-task not found.');
  });

  it('should return false when deleting a non-existent task', async () => {
    const deleted = await taskService.deleteTask('nonexistent-task');
    expect(deleted).toBe(false);
  });
});
