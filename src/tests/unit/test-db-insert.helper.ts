/* eslint-disable @typescript-eslint/no-explicit-any */
export const insertHelpers = {
  async insertSession(client: any, sessionId: string, assistantId: string, userId: string) {
    await client.query(
      `
        INSERT INTO sessions (id, name, assistant_id, user_id, started_at, created_at)
        VALUES ($1, 'Test Session', $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING
        RETURNING *;
      `,
      [sessionId, assistantId, userId]
    );
  },

  async insertChat(client: any, chatId: string, sessionId: string) {
    await client.query(
      `
        INSERT INTO chats (id, session_id, created_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING
        RETURNING *;
      `,
      [chatId, sessionId]
    );
  },

  async insertChatMessage(client: any, messageId: string, chatId: string, memoryId: string) {
    // Ensure the memory exists before inserting the chat message
    await this.insertMemory(client, memoryId, 'Sample Memory Description');

    await client.query(
      `
        INSERT INTO chat_messages (id, type, memory_id, created_at, chat_id)
        VALUES ($1, 'user', $2, CURRENT_TIMESTAMP, $3)
        ON CONFLICT (id) DO NOTHING;
      `,
      [messageId, memoryId, chatId]
    );
  },

  async insertTag(client: any, tagId: string, tagName: string) {
    await client.query(
      `
      INSERT INTO tags (id, name)
      VALUES ($1, $2)
      ON CONFLICT (id) DO NOTHING
      RETURNING *;
    `,
      [tagId, tagName]
    );
  },
  async insertTagMemory(client: any, memoryId: string = '1', tagId: string = '1') {
    // Ensure the memory exists before inserting the tag-memory relationship
    await this.insertMemory(client, memoryId, 'Sample Memory Description'); // Insert memory if it doesn't exist

    // Ensure the tag exists before inserting the tag-memory relationship
    await this.insertTag(client, tagId, `TestTag${tagId}`); // Insert tag if not already present

    // Insert the memory-tag association
    await client.query(
      `
        INSERT INTO memory_tags (memory_id, tag_id)
        VALUES ($1, $2)
        ON CONFLICT (memory_id, tag_id) DO NOTHING
        RETURNING *;
      `,
      [memoryId, tagId]
    );
  },

  async insertAssistant(client: any, assistantId: string = '1') {
    await client.query(
      `
        INSERT INTO assistants (id, name, description, type, model, created_at, updated_at, gpt_assistant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING
        RETURNING *;
      `,
      [
        assistantId,
        `Test Assistant ${assistantId}`,
        `Description for Assistant ${assistantId}`,
        'chat',
        'gpt-3.5-turbo',
        new Date().toISOString(),
        new Date().toISOString(),
        'test_gpt_assistant_id', // Add a fake GPT assistant ID for testing
      ]
    );
  },

  async insertMemory(client: any, id: string, text: string) {
    const now = new Date();
    const timeOffset = Math.random(); // Add a small random time offset to ensure uniqueness

    await client.query(
      `
    INSERT INTO memories (id, type, description, created_at, updated_at)
    VALUES ($1, 'knowledge', $2, $3, $3)
    ON CONFLICT (id) DO NOTHING
    RETURNING *;
  `,
      [id, text, new Date(now.getTime() + timeOffset * 1000).toISOString()] // Offset the time by a random amount
    );
  },

  async insertOwnedMemory(client: any, assistantId: string, memoryId: string) {
    await client.query(
      `
        INSERT INTO owned_memories (assistant_id, memory_id)
        VALUES ($1, $2)
        ON CONFLICT (assistant_id, memory_id) DO NOTHING
        RETURNING *;
      `,
      [assistantId, memoryId]
    );
  },

  async presetOwnedMemoryTestData(client: any) {
    await this.insertAssistant(client, '1');
    await this.insertMemory(client, '1', 'Memory 1');
    await this.insertMemory(client, '2', 'Memory 2');
    await this.insertMemory(client, '3', 'Memory 3');
  },

  async presetMemoryExtraTestData(client: any) {
    const id = 'memoryExtraId';
    await insertHelpers.insertMemory(client, id + '1', 'Memory 1');
    await insertHelpers.insertMemory(client, id + '2', 'Memory 2');
    await insertHelpers.insertMemory(client, id + '3', 'Memory 3');

    await insertHelpers.insertTag(client, id + '1', id + 'Tag1');
    await insertHelpers.insertTag(client, id + '2', id + 'Tag2');
    await insertHelpers.insertTag(client, id + '3', id + 'Tag3');
    await client.query(`INSERT INTO memory_tags (memory_id, tag_id) VALUES ('${id}1', '${id}1'), ('${id}1', '${id}2') ON CONFLICT (memory_id, tag_id) DO NOTHING`);
  },

  async presetMemoryFocusRuleTestData(client: any) {
    await insertHelpers.insertAssistant(client, '1');
    await insertHelpers.insertMemoryFocusRule(client, '1', '1');
  },
  /**
   * Inserts tags into the database.
   */
  async insertTags(client: any) {
    await client.query(
      `INSERT INTO tags (id, name) 
       VALUES ('1', 'Tag1'), ('2', 'Tag2'), ('3', 'Tag3') 
       ON CONFLICT (id) DO NOTHING`
    );
  },

  /**
   * Inserts a task into the database.
   */
  async insertTask(client: any, taskId: string = '1', description: string = 'Sample Task', assignedAssistant: string = '1', status: string = 'pending') {
    // Ensure the assistant exists first
    await this.insertAssistant(client, assignedAssistant); // Ensure valid assistant before inserting task

    await client.query(
      `INSERT INTO tasks (id, description, assigned_assistant, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [taskId, description, assignedAssistant, status]
    );
  },
  /**
   * Inserts a relationship into the relationship_graph table.
   */
  async insertRelationship(
    client: any,
    relationshipId: string = '1', // Unique relationship ID
    type: string = 'assistant', // Type of entity (could be 'assistant', 'memory', or 'task')
    targetId: string = '1', // ID of the related entity
    relationshipType: string = 'related_to' // Type of relationship ('related_to', 'part_of', etc.)
  ) {
    await client.query(
      `INSERT INTO relationship_graph (id, type, target_id, relationship_type, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT (id) DO NOTHING`, // Prevent insertion if the relationship ID already exists
      [relationshipId, type, targetId, relationshipType]
    );
  },
  /**
   * Inserts feedback into the database.
   */
  async insertFeedback(client: any, feedbackId: string = '1', assistantId: string = '1', rating: number = 5, comments: string = 'Great assistant!') {
    await client.query(
      `INSERT INTO feedback (id, target_id, target_type, rating, comments, created_at, updated_at) 
       VALUES ($1, $2, 'assistant', $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [feedbackId, assistantId, rating, comments]
    );
  },

  /**
   * Inserts a memory focus rule.
   */
  async insertMemoryFocusRule(client: any, ruleId: string = '1', assistantId: string = '1', maxResults: number = 5) {
    await client.query(
      `INSERT INTO memory_focus_rules (id, assistant_id, max_results, relationship_types, priority_tags, created_at, updated_at) 
       VALUES ($1, $2, $3, '[]', '[]', NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [ruleId, assistantId, maxResults]
    );
  },

  /**
   * Inserts a focused memory.
   */
  async insertFocusedMemory(client: any, memoryFocusId: string, memoryId: string) {
    await client.query(
      `INSERT INTO focused_memories (memory_focus_id, memory_id)
       VALUES ($1, $2)
       ON CONFLICT (memory_focus_id, memory_id) DO NOTHING`,
      [memoryFocusId, memoryId]
    );
  },

  /**
   * Inserts a full set of test data for focused memory tests.
   */
  async insertFocusedMemoryTestData(client: any, id: string) {
    const id1 = id + 'focusedMemoryId' + 1;
    const id2 = id + 'focusedMemoryId' + 2;
    await this.insertAssistant(client, id1);
    await this.insertAssistant(client, id2);
    await this.insertMemory(client, id + 'focusedMemoryId' + '1', 'Memory Description 1');
    await this.insertMemory(client, id + 'focusedMemoryId' + '2', 'Memory Description 2');
    await this.insertMemory(client, id + 'focusedMemoryId' + '3', 'Memory Description 3');
    await this.insertMemoryFocusRule(client, id1, id + 'focusedMemoryId' + '1'); // Focus rule for assistant 1
    await this.insertMemoryFocusRule(client, id2, id + 'focusedMemoryId' + '2'); // Focus rule for assistant 2
  },
};
