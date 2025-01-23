import Database from 'better-sqlite3';

export const insertHelpers = {
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

  insertFullAssistantSetup(db: Database.Database, assistantId: string = '1') {
    // Insert the assistant
    this.insertAssistant(db, assistantId);

    // Insert tags and associate them with the assistant
    this.insertTags(db, assistantId);

    // Insert a memory focus rule for the assistant
    this.insertMemoryFocusRule(db, '1', assistantId);

    // Insert multiple memories and associate them with the focus rule
    this.insertMemories(db); // Inserts multiple memories
    this.insertFocusedMemory(db, '1', '2'); // Associate second memory
  },

  insertAssistant(db: Database.Database, assistantId: string = '1') {
    db.prepare(
      `
      INSERT OR IGNORE INTO assistants (id, name, description, type, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    ).run(assistantId, `Test Assistant ${assistantId}`, `Description for Assistant ${assistantId}`, 'completion', new Date().toISOString(), new Date().toISOString());
  },

  insertMemoryFocusRule(db: Database.Database, ruleId: string = '1', assistantId: string = '1') {
    this.insertAssistant(db, assistantId);

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

  insertMemory(db: Database.Database, id: string) {
    // Insert standalone memories
    db.prepare(
      `
    INSERT OR IGNORE INTO memories (id, type, description, createdAt, updatedAt)
    VALUES (?, 'knowledge', 'Memory Description', ?, ?)
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
