/* eslint-disable @typescript-eslint/no-explicit-any */
import Database from 'better-sqlite3';
import { TaskRequest } from '../../../models/service-models/orchestrator.service.model';
import { TaskDelegationService } from '../../../services/orchestrator-services/task-delegation.service';

describe('TaskDelegationService', () => {
  let db: Database.Database;
  let taskDelegationService: TaskDelegationService;

  beforeEach(() => {
    db = new Database(':memory:');
    // Create minimal schema required for tasks, tags, and tag mappings.
    db.exec(`
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        description TEXT,
        assignedAssistant TEXT,
        status TEXT,
        inputData TEXT,
        outputData TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
      CREATE TABLE tags (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );
      CREATE TABLE task_tags (
        task_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        entity TEXT NOT NULL,
        PRIMARY KEY (task_id, tag_id, entity)
      );
    `);
    taskDelegationService = new TaskDelegationService(db);

    // Override tagService to simulate ensuring tag existence.
    taskDelegationService.tagService = {
      ensureTagExists: async (tagName: string): Promise<string> => {
        let tag: any = db.prepare(`SELECT * FROM tags WHERE name = ?`).get(tagName);
        if (!tag) {
          // For testing, we generate a simple id based on the tag name.
          const newId = tagName + '-id';
          db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(newId, tagName);
          tag = { id: newId, name: tagName };
        }
        return tag.id;
      },
    } as any;

    // Override tagExtraService to simulate adding tag mappings to task_tags.
    taskDelegationService.tagExtraService = {
      addTagToEntity: async (entityId: string, tagId: string, entity: string): Promise<boolean> => {
        db.prepare(`INSERT INTO task_tags (task_id, tag_id, entity) VALUES (?, ?, ?)`).run(entityId, tagId, entity);
        return true;
      },
    } as any;
  });

  afterEach(() => {
    db.close();
  });

  test('delegateTask creates a task without tags', async () => {
    const assistantId: string = 'assistant1';
    const task: TaskRequest = { type: 'test', description: 'Test task delegation' };
    const response: any = await taskDelegationService.delegateTask(assistantId, task);
    expect(response.success).toBe(true);
    expect(response.output).toBeDefined();
    expect(response.output.assignedAssistant).toBe(assistantId);
    expect(response.output.status).toBe('pending');

    // Verify task was inserted
    const taskRow: any = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(response.output.taskId);
    expect(taskRow).toBeDefined();
    expect(taskRow.assignedAssistant).toBe(assistantId);
    expect(taskRow.description).toBe('Test task delegation');

    // Verify that no tag mappings exist for this task.
    const mappings: any[] = db.prepare(`SELECT * FROM task_tags WHERE task_id = ?`).all(response.output.taskId);
    expect(mappings.length).toBe(0);
  });

  test('delegateTask creates a task with tags', async () => {
    const assistantId: string = 'assistant2';
    const task: TaskRequest = { type: 'test', description: 'Task with tags' };
    const tagNames: string[] = ['urgent', 'backend'];
    const response: any = await taskDelegationService.delegateTask(assistantId, task, tagNames);
    expect(response.success).toBe(true);

    // Verify task insertion
    const taskRow: any = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(response.output.taskId);
    expect(taskRow).toBeDefined();
    expect(taskRow.assignedAssistant).toBe(assistantId);
    expect(taskRow.description).toBe('Task with tags');

    // For each provided tag, verify that a tag row exists and that a mapping exists in task_tags.
    for (const tagName of tagNames) {
      const tagRow: any = db.prepare(`SELECT * FROM tags WHERE name = ?`).get(tagName);
      expect(tagRow).toBeDefined();
      const mapping: any = db.prepare(`SELECT * FROM task_tags WHERE task_id = ? AND tag_id = ? AND entity = 'task'`).get(response.output.taskId, tagRow.id);
      expect(mapping).toBeDefined();
    }
  });
});
