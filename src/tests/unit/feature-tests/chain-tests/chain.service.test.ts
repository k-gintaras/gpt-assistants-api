import { Pool } from 'pg';
import { ChainService } from '../../../../services/orchestrator-services/chain/chain.service';
import { getDb } from '../../test-db.helper';
import { AiApiRequest, AiApiResponse } from '../../../../services/ai-api.model';
import { AiApi, AiApiService } from '../../../../services/ai-api.service';

// Mock AiApi for testing
class MockAiApi implements AiApi {
  public capturedRequests: AiApiRequest[] = [];

  constructor(private customResponse: string = 'Mock response', private shouldFail: boolean = false) {}

  isAvailable(): boolean {
    return true;
  }

  async ask(request: AiApiRequest): Promise<AiApiResponse | null> {
    this.capturedRequests.push(request); // Capture the request for inspection

    if (this.shouldFail) {
      return null;
    }

    return {
      response: this.customResponse,
      responseType: 'text',
      conversationId: request.conversationId,
      error: null,
    };
  }
}

// Mock AiApiService for testing - accept optional assistantType for compatibility
class MockAiApiService extends AiApiService {
  public mockApi: MockAiApi;

  constructor(private customResponse: string = 'Mock response', private shouldFail: boolean = false) {
    super();
    this.mockApi = new MockAiApi(customResponse, shouldFail);
  }

  getAiApi(_assistantType?: string): AiApi | null {
    return this.mockApi;
  }
}

describe('ChainService Integration Tests', () => {
  let db: Pool;
  let chainService: ChainService;

  beforeAll(async () => {
    await getDb.initialize();
    db = getDb.getInstance();
  });

  afterAll(async () => {
    await getDb.close();
  });

  beforeEach(async () => {
    // Clean database state before each test
    await db.query('DELETE FROM relationship_graph');
    await db.query('DELETE FROM tasks');
    await db.query('DELETE FROM assistants');

    chainService = new ChainService(db);
    // Replace the real AiApiService with our mock
    chainService.aiApiService = new MockAiApiService();
  });

  afterEach(async () => {
    // Additional safety cleanup after each test
    await db.query('DELETE FROM relationship_graph');
    await db.query('DELETE FROM tasks');
    await db.query('DELETE FROM assistants');
  });

  // Helper to create test assistants
  async function createTestAssistants(count: number): Promise<string[]> {
    const assistantIds: string[] = [];

    for (let i = 0; i < count; i++) {
      const assistantId = `test-assistant-${i}`;
      await db.query(
        `
        INSERT INTO assistants (id, name, description, type, model, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
        [assistantId, `Test Assistant ${i}`, 'Test description', 'chat', 'gpt-3.5-turbo', new Date().toISOString(), new Date().toISOString()]
      );
      assistantIds.push(assistantId);
    }

    return assistantIds;
  }

  test('should plan a broadcast chain correctly', async () => {
    // Arrange
    const assistantIds = await createTestAssistants(2);
    const messages = [
      { role: 'user' as const, content: 'Design the interface' },
      { role: 'user' as const, content: 'Write the HTML' }
    ];

    // Act
    const result = await chainService.planBroadcastChain({
      assistantIds,
      messages,
      description: 'Test Broadcast Chain'
    });

    // Assert
    expect(result.parentId).toBeDefined();
    expect(result.childIds).toHaveLength(4); // 2 assistants * 2 messages

    // Verify parent task
    const parentTask = await chainService.taskService.getTaskById(result.parentId);
    expect(parentTask).not.toBeNull();
    expect(parentTask?.description).toBe('Test Broadcast Chain');
    expect(parentTask?.assignedAssistant).toBeNull();
    expect(parentTask?.status).toBe('in_progress');

    // Verify child tasks
    for (const childId of result.childIds) {
      const childTask = await chainService.taskService.getTaskById(childId);
      expect(childTask).not.toBeNull();
      expect(childTask?.status).toBe('pending');
      expect(assistantIds).toContain(childTask?.assignedAssistant);
    }

    // Verify relationships
    const relationships = await chainService.relationshipGraphService.getRelationshipsBySource(result.parentId);
    expect(relationships).toHaveLength(4);
    relationships.forEach(rel => {
      expect(rel.relationshipType).toBe('subtask_of');
      expect(result.childIds).toContain(rel.targetId);
    });
  });

  test('should run broadcast chain and complete all tasks', async () => {
    // Arrange
    const assistantIds = await createTestAssistants(2);
    const messages = [
      { role: 'user' as const, content: 'Design the interface' },
      { role: 'user' as const, content: 'Write the HTML' }
    ];

    const { parentId, childIds } = await chainService.planBroadcastChain({
      assistantIds,
      messages,
      description: 'Test Broadcast Chain'
    });

    // Act - run the chain (should complete quickly with mock)
    await chainService.runBroadcastChain(parentId);

    // Assert
    const progress = await chainService.getChainProgress(parentId);
    expect(progress.done).toBe(4);
    expect(progress.total).toBe(4);
    expect(progress.pct).toBe(100);

    // Verify parent task is completed
    const parentTask = await chainService.taskService.getTaskById(parentId);
    expect(parentTask?.status).toBe('completed');

    // Verify all child tasks are completed
    const allTasks = await chainService.taskService.getAllTasks();
    const childTasks = allTasks.filter(task => childIds.includes(task.id));
    childTasks.forEach(task => {
      expect(task.status).toBe('completed');
      expect(task.outputData).toBeDefined();
      // outputData may be stored as an object or a JSON string depending on the driver
      const output = typeof task.outputData === 'string' ? JSON.parse(task.outputData) : task.outputData as any;
      expect(output).toHaveProperty('reply');
      expect(output).toHaveProperty('responseType');
      expect(output.responseType).toBe('text');
    });
  }, 10000); // Increase timeout for async operations

  test('should handle task failures gracefully', async () => {
    // Arrange
    const assistantIds = await createTestAssistants(1);
    const messages = [
      { role: 'user' as const, content: 'Design the interface' }
    ];

    // Use failing mock
    chainService.aiApiService = new MockAiApiService('Mock response', true);

    const { parentId, childIds } = await chainService.planBroadcastChain({
      assistantIds,
      messages,
      description: 'Test Failing Chain'
    });

    // Act
    await chainService.runBroadcastChain(parentId);

    // Verify task is marked as failed
    const failedTask = await chainService.taskService.getTaskById(childIds[0]);
    expect(failedTask?.status).toBe('failed');
    // outputData may be object or string
    const fd = typeof failedTask?.outputData === 'string' ? JSON.parse(failedTask!.outputData!) : failedTask?.outputData as any;
    expect(fd).toHaveProperty('error');
    expect(fd.error).toContain('AI API failed to return a response');
  });

  test('should get correct progress for partially completed chain', async () => {
    // Arrange
    const assistantIds = await createTestAssistants(2);
    const messages = [
      { role: 'user' as const, content: 'Design the interface' },
      { role: 'user' as const, content: 'Write the HTML' }
    ];

    const { parentId, childIds } = await chainService.planBroadcastChain({
      assistantIds,
      messages,
      description: 'Test Partial Chain'
    });

    // Ensure all child tasks are pending, then complete one deterministically
    for (const id of childIds) {
      await chainService.taskService.updateTask(id, { status: 'pending' });
    }
    await chainService.taskService.updateTask(childIds[0], { status: 'completed' });

    // Act
    const progress = await chainService.getChainProgress(parentId);

    // Compute expected counts locally using services to avoid driver SQL edge-cases
    const rels = await chainService.relationshipGraphService.getRelationshipsBySource(parentId);
    const childIdsFromRels = rels.map(r => r.targetId);
    const childTasks = await Promise.all(childIdsFromRels.map(id => chainService.taskService.getTaskById(id)));
    const expectedTotal = childTasks.length;
    const expectedDone = childTasks.filter(t => t?.status === 'completed').length;

    // Assert the service reports the same counts
    expect(progress.total).toBe(expectedTotal);
    expect(progress.done).toBe(expectedDone);
    // percent should match integer math
    const expectedPct = expectedTotal === 0 ? 0 : Math.floor((expectedDone * 100) / expectedTotal);
    expect(progress.pct).toBe(expectedPct);
  });

  test('should handle empty assistant list', async () => {
    // Arrange
    const messages = [
      { role: 'user' as const, content: 'Design the interface' }
    ];

    // Act & Assert
    await expect(chainService.planBroadcastChain({
      assistantIds: [],
      messages,
      description: 'Empty Chain'
    })).rejects.toThrow();
  });

  test('should handle empty messages list', async () => {
    // Arrange
    const assistantIds = await createTestAssistants(1);

    // Act & Assert
    await expect(chainService.planBroadcastChain({
      assistantIds,
      messages: [],
      description: 'Empty Messages Chain'
    })).rejects.toThrow();
  });
});