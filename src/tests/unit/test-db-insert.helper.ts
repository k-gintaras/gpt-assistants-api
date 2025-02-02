import Database from 'better-sqlite3';

export const insertHelpers = {
  insertTagMemory(db: Database.Database, memoryId: string = '1', tagId: string = '1') {
    db.prepare(
      `
      INSERT OR IGNORE INTO memory_tags (memory_id, tag_id)
      VALUES (?, ?)
    `
    ).run(memoryId, tagId);
  },

  insertTags(db: Database.Database, assistantId: string = '1') {
    db.prepare(
      `
    INSERT OR IGNORE INTO tags (id, name)
    VALUES ('1', 'Tag1'), ('2', 'Tag2')
  `
    ).run();

    db.prepare(
      `
    INSERT OR IGNORE INTO assistant_tags (assistant_id, tag_id)
    VALUES (?, ?), (?, ?)
  `
    ).run(assistantId, '1', assistantId, '2');
  },

  insertFeedback(db: Database.Database, feedbackId: string = '1', assistantId: string = '1') {
    db.prepare(
      `
    INSERT OR IGNORE INTO feedback (id, target_id, target_type, rating, comments, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
    ).run(feedbackId, assistantId, 'assistant', 3, 'Great assistant!', new Date().toISOString(), new Date().toISOString());
  },

  insertFullAssistantSetup(db: Database.Database, assistantId: string = '1') {
    // Insert the assistant
    this.insertAssistant(db, assistantId, true);

    // Insert tags and associate them with the assistant
    this.insertTags(db, assistantId);

    // Insert a memory focus rule for the assistant
    this.insertMemoryFocusRule(db, '1', assistantId);

    // Insert multiple memories and associate them with the focus rule
    this.insertMemories(db); // Inserts multiple memories
    this.insertFocusedMemory(db, '1', '2'); // Associate second memory
  },

  insertRelationship(db: Database.Database, sourceId: string = '1', targetId: string = '2', relationshipType: string = 'related_to') {
    // Make sure the relationshipType is valid
    const validRelationshipTypes = ['related_to', 'part_of', 'example_of', 'derived_from', 'depends_on', 'blocks', 'subtask_of'];
    if (!validRelationshipTypes.includes(relationshipType)) {
      throw new Error('Invalid relationship type.');
    }

    db.prepare(
      `
      INSERT OR IGNORE INTO relationship_graph (id, type, target_id, relationship_type, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    ).run(sourceId, 'assistant', targetId, relationshipType, new Date().toISOString(), new Date().toISOString());
  },
  insertAssistant(db: Database.Database, assistantId: string = '1', isAssistant?: boolean) {
    db.prepare(
      `
      INSERT OR IGNORE INTO assistants (id, name, description, type, model, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      assistantId,
      `Test Assistant ${assistantId}`,
      `Description for Assistant ${assistantId}`,
      isAssistant ? 'assistant' : 'chat', // Use valid type
      'gpt-3.5-turbo', // Specify a model
      new Date().toISOString(),
      new Date().toISOString()
    );
  },

  insertTask(db: Database.Database, taskId: string = '1', description: string = 'Sample Task', assignedAssistant: string = '1', status: string = 'pending'): void {
    const stmt = db.prepare(
      `
    INSERT OR IGNORE INTO tasks (id, description, assignedAssistant, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `
    );
    try {
      stmt.run(taskId, description, assignedAssistant, status, new Date().toISOString(), new Date().toISOString());
    } catch (error) {
      console.error(`Error inserting task (taskId: ${taskId}, assignedAssistant: ${assignedAssistant}):`, error);
    }
  },

  insertMemoryFocusRule(db: Database.Database, ruleId: string = '1', assistantId: string = '1') {
    this.insertAssistant(db, assistantId, false);

    db.prepare(
      `
      INSERT OR IGNORE INTO memory_focus_rules (id, assistant_id, maxResults, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `
    ).run(ruleId, assistantId, 5, new Date().toISOString(), new Date().toISOString());
  },

  insertFocusedMemory(db: Database.Database, memoryFocusId: string, memoryId: string): void {
    const stmt = db.prepare(
      `
      INSERT OR IGNORE INTO focused_memories (memory_focus_id, memory_id)
      VALUES (?, ?)
    `
    );
    try {
      stmt.run(memoryFocusId, memoryId);
    } catch (error) {
      console.error(`Error inserting focused memory (memoryFocusId: ${memoryFocusId}, memoryId: ${memoryId}):`, error);
    }
  },

  insertOwnedMemory(db: Database.Database, assistantId: string, memoryId: string): void {
    const stmt = db.prepare(
      `
      INSERT OR IGNORE INTO owned_memories (assistant_id, memory_id)
      VALUES (?, ?)
    `
    );
    try {
      stmt.run(assistantId, memoryId);
    } catch (error) {
      console.error(`Error inserting focused memory (memoryFocusId: ${assistantId}, memoryId: ${memoryId}):`, error);
    }
  },

  insertMemories(db: Database.Database) {
    // Insert standalone memories
    db.prepare(
      `
    INSERT OR IGNORE INTO memories (id, type, description, createdAt, updatedAt)
    VALUES ('1', 'knowledge', 'Memory Description', ?, ?),
           ('2', 'knowledge', 'Another Memory Description', ?, ?)
  `
    ).run(new Date().toISOString(), new Date().toISOString(), new Date().toISOString(), new Date().toISOString());
  },

  insertMemoriesX3(db: Database.Database) {
    const now = new Date().toISOString();
    const past = new Date(Date.now() - 10000).toISOString(); // 10 seconds earlier

    db.prepare(
      `
    INSERT OR IGNORE INTO memories (id, type, description, createdAt, updatedAt)
    VALUES ('1', 'knowledge', 'Memory Description', ?, ?),
           ('2', 'knowledge', 'Another Memory Description', ?, ?),
           ('3', 'knowledge', 'Memory Description 3', ?, ?)
    `
    ).run(past, past, now, now, new Date().toISOString(), new Date().toISOString());
  },
  insertMemory(db: Database.Database, id: string) {
    // Insert a single memory
    db.prepare(
      `
    INSERT OR IGNORE INTO memories (id, type, description, createdAt, updatedAt)
    VALUES (?, 'knowledge', 'Memory Description ${id}', ?, ?)
  `
    ).run(id, new Date().toISOString(), new Date().toISOString());
  },

  insertMemoryFocusRules(db: Database.Database) {
    db.prepare(
      `
      INSERT OR IGNORE INTO memory_focus_rules (id, assistant_id, maxResults, relationshipTypes, priorityTags, createdAt, updatedAt)
      VALUES ('1', '1', 10, '[]', '[]', ?, ?)
    `
    ).run(new Date().toISOString(), new Date().toISOString());
  },
};
