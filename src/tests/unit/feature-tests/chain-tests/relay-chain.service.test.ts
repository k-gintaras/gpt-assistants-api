import { Pool } from 'pg';
import { RelayChainService } from '../../../../services/orchestrator-services/chain/relay-chain.service';
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
    this.capturedRequests.push(request);

    if (this.shouldFail) {
      return null;
    }

    return {
      response: `${this.customResponse} [${request.prompt}]`,
      responseType: 'text',
      conversationId: request.conversationId,
      error: null,
    };
  }
}

// Mock AiApiService for testing
class MockAiApiService extends AiApiService {
  public mockApi: MockAiApi;

  constructor(private customResponse: string = 'Mock response', private shouldFail: boolean = false) {
    super();
    this.mockApi = new MockAiApi(customResponse, shouldFail);
  }

  getAiApi(): AiApi | null {
    return this.mockApi;
  }
}

describe('RelayChainService Integration Tests', () => {
  let db: Pool;
  let relayChainService: RelayChainService;

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

    relayChainService = new RelayChainService(db);
    // Replace the real AiApiService with our mock
    relayChainService.aiApiService = new MockAiApiService();
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

  test('should plan a relay chain correctly', async () => {
    // Arrange
    const assistantIds = await createTestAssistants(3);
    const steps = [
      { assistantId: assistantIds[0], messageTemplate: 'Design the interface' },
      { assistantId: assistantIds[1], messageTemplate: 'Given INTERFACE:\n{{prev_reply}}\nCreate HTML' },
      { assistantId: assistantIds[2], messageTemplate: 'Given HTML:\n{{prev_reply}}\nAdd styling' }
    ];

    // Act
    const result = await relayChainService.planRelayChain({
      steps,
      description: 'Test Relay Chain'
    });

    // Assert
    expect(result.parentId).toBeDefined();
    expect(result.stepIds).toHaveLength(3);

    // Verify parent task
    const parentTask = await relayChainService.taskService.getTaskById(result.parentId);
    expect(parentTask).not.toBeNull();
    expect(parentTask?.description).toBe('Test Relay Chain');
    expect(parentTask?.assignedAssistant).toBeNull();
    expect(parentTask?.status).toBe('in_progress');

    // Verify step tasks
    for (let i = 0; i < result.stepIds.length; i++) {
      const stepTask = await relayChainService.taskService.getTaskById(result.stepIds[i]);
      expect(stepTask).not.toBeNull();
      expect(stepTask?.status).toBe('pending');
      expect(stepTask?.assignedAssistant).toBe(assistantIds[i]);
    }

    // Verify subtask relationships
    const relationships = await relayChainService.relationshipGraphService.getRelationshipsBySource(result.parentId);
    const subtaskRels = relationships.filter(rel => rel.relationshipType === 'subtask_of');
    expect(subtaskRels).toHaveLength(3);

    // Verify dependency chain (each step depends on previous)
    for (let i = 1; i < result.stepIds.length; i++) {
      const stepRels = await relayChainService.relationshipGraphService.getRelationshipsBySource(result.stepIds[i]);
      const dependsOn = stepRels.find(rel => rel.relationshipType === 'depends_on');
      expect(dependsOn).toBeDefined();
      expect(dependsOn?.targetId).toBe(result.stepIds[i - 1]);
    }
  });

  test('should run relay chain in correct order', async () => {
    // Arrange
    const assistantIds = await createTestAssistants(3);
    const steps = [
      { assistantId: assistantIds[0], messageTemplate: 'Step 1: Design interface' },
      { assistantId: assistantIds[1], messageTemplate: 'Step 2: {{prev_reply}} -> Create HTML' },
      { assistantId: assistantIds[2], messageTemplate: 'Step 3: {{prev_reply}} -> Add CSS' }
    ];

    const { parentId, stepIds } = await relayChainService.planRelayChain({
      steps,
      description: 'Test Sequential Relay'
    });

    // Act
    await relayChainService.runRelayChain(parentId);

    // Assert
    const progress = await relayChainService.getRelayChainProgress(parentId);
    expect(progress.done).toBe(3);
    expect(progress.total).toBe(3);
    expect(progress.pct).toBe(100);

    // Verify parent completed
    const parentTask = await relayChainService.taskService.getTaskById(parentId);
    expect(parentTask?.status).toBe('completed');

    // Verify all steps completed in order
    for (let i = 0; i < stepIds.length; i++) {
      const stepTask = await relayChainService.taskService.getTaskById(stepIds[i]);
      expect(stepTask?.status).toBe('completed');
      
      const output = typeof stepTask?.outputData === 'string' 
        ? JSON.parse(stepTask!.outputData!) 
        : (stepTask?.outputData ?? {}) as { reply: string; promptEcho: string };
      
      expect(output).toHaveProperty('reply');
      expect(output).toHaveProperty('promptEcho');
      
      // Verify template was applied correctly
      if (i === 0) {
        expect(output.promptEcho).toContain('Step 1: Design interface');
      } else {
        // Should contain previous step's reply
        expect(output.promptEcho).toContain('Mock response');
      }
    }
  }, 15000);

  test('should fail relay chain when step fails', async () => {
    // Arrange
    const assistantIds = await createTestAssistants(2);
    const steps = [
      { assistantId: assistantIds[0], messageTemplate: 'Step 1' },
      { assistantId: assistantIds[1], messageTemplate: 'Step 2: {{prev_reply}}' }
    ];

    // Use failing mock
    relayChainService.aiApiService = new MockAiApiService('Mock response', true);

    const { parentId, stepIds } = await relayChainService.planRelayChain({
      steps,
      description: 'Test Failing Relay'
    });

    // Act
    await relayChainService.runRelayChain(parentId);

    // Assert - first step should fail, second should remain pending
    const firstStep = await relayChainService.taskService.getTaskById(stepIds[0]);
    expect(firstStep?.status).toBe('failed');

    const secondStep = await relayChainService.taskService.getTaskById(stepIds[1]);
    expect(secondStep?.status).toBe('pending');

    // Parent should be failed
    const parentTask = await relayChainService.taskService.getTaskById(parentId);
    expect(parentTask?.status).toBe('failed');
  });

  test('should get relay chain progress with step tracking', async () => {
    // Arrange
    const assistantIds = await createTestAssistants(3);
    const steps = [
      { assistantId: assistantIds[0], messageTemplate: 'Step 1' },
      { assistantId: assistantIds[1], messageTemplate: 'Step 2: {{prev_reply}}' },
      { assistantId: assistantIds[2], messageTemplate: 'Step 3: {{prev_reply}}' }
    ];

    const { parentId, stepIds } = await relayChainService.planRelayChain({
      steps,
      description: 'Test Progress Tracking'
    });

    // Mark first step as completed, second as in_progress, third stays pending
    await relayChainService.taskService.updateTask(stepIds[0], { status: 'completed' });
    await relayChainService.taskService.updateTask(stepIds[1], { status: 'in_progress' });

    // Act
    const progress = await relayChainService.getRelayChainProgress(parentId);

    // Assert
    expect(progress.total).toBe(3);
    expect(progress.done).toBe(1);
    expect(progress.pct).toBe(33);
    expect(progress.stepTrack).toContain('completed');
    expect(progress.stepTrack).toContain('in_progress');
    expect(progress.stepTrack).toContain('pending');
    expect(progress.stepTrack).toContain('->');
  });

  test('should handle empty steps list', async () => {
    // Arrange & Act & Assert
    await expect(
      relayChainService.planRelayChain({
        steps: [],
        description: 'Empty Steps'
      })
    ).rejects.toThrow('steps cannot be empty');
  });

  test('should correctly apply template with previous output', async () => {
    // Arrange
    const assistantIds = await createTestAssistants(2);
    const steps = [
      { assistantId: assistantIds[0], messageTemplate: 'First prompt' },
      { assistantId: assistantIds[1], messageTemplate: 'Second prompt uses: {{prev_reply}}' }
    ];

    const { parentId } = await relayChainService.planRelayChain({
      steps,
      description: 'Test Template'
    });

    // Act
    await relayChainService.runRelayChain(parentId);

    // Assert - check that second step received first step's output
    const allTasks = await relayChainService.taskService.getAllTasks();
    const relayTasks = allTasks.filter(t => t.description?.includes('Relay step'));
    relayTasks.sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());

    const secondStepTask = relayTasks[1];
    const output = typeof secondStepTask.outputData === 'string'
      ? JSON.parse(secondStepTask.outputData!)
      : (secondStepTask.outputData ?? {}) as { reply: string; promptEcho: string };

    expect(output.promptEcho).toContain('Second prompt uses: Mock response');
  }, 15000);

  test('should handle relay chain with single step', async () => {
    // Arrange
    const assistantIds = await createTestAssistants(1);
    const steps = [
      { assistantId: assistantIds[0], messageTemplate: 'Single step task' }
    ];

    const { parentId, stepIds } = await relayChainService.planRelayChain({
      steps,
      description: 'Single Step Chain'
    });

    // Act
    await relayChainService.runRelayChain(parentId);

    // Assert
    expect(stepIds).toHaveLength(1);
    const progress = await relayChainService.getRelayChainProgress(parentId);
    expect(progress.done).toBe(1);
    expect(progress.total).toBe(1);
    expect(progress.pct).toBe(100);

    const parentTask = await relayChainService.taskService.getTaskById(parentId);
    expect(parentTask?.status).toBe('completed');
  }, 10000);
});
