import Database from 'better-sqlite3';
import { buildGetAssistantWithFiltersQuery, GET_FULL_ASSISTANT_WITH_DETAILS } from '../../../queries/assistant.queries';
import { testDbHelper } from '../test-db.helper';
import { insertHelpers } from '../test-db-insert.helper';
let db: Database.Database;

describe('GET_FULL_ASSISTANT_WITH_DETAILS', () => {
  beforeEach(async () => {
    db = testDbHelper.initialize();
    insertHelpers.insertFullAssistantSetup(db, '1');
  });
  afterEach(() => {
    testDbHelper.reset();
  });

  afterAll(() => {
    testDbHelper.close();
  });

  it('retrieves assistant details with expected data structure', async () => {
    const stmt = db.prepare(GET_FULL_ASSISTANT_WITH_DETAILS);
    const result = stmt.all(['1']);
    expect(Array.isArray(result)).toBe(true); // Checks if it's an array
    expect(result[0]).toHaveProperty('assistant_id', '1');
    expect(result[0]).toHaveProperty('assistant_name', 'Test Assistant' + ' 1');
  });
});

describe('buildGetAssistantWithFiltersQuery', () => {
  beforeEach(async () => {
    db = testDbHelper.initialize();
  });
  afterEach(() => {
    testDbHelper.reset();
  });

  afterAll(() => {
    testDbHelper.close();
  });
  function normalizeWhitespace(sql: string): string {
    return sql.replace(/\s+/g, ' ').trim();
  }

  describe('buildGetAssistantWithFiltersQuery', () => {
    it('builds query with no filters', () => {
      const query = buildGetAssistantWithFiltersQuery({});
      const expectedQuery = `
      SELECT a.* 
      FROM assistants a
      LEFT JOIN assistant_tags at ON a.id = at.assistant_id
      LEFT JOIN tags t ON at.tag_id = t.id
    `;
      expect(normalizeWhitespace(query)).toBe(normalizeWhitespace(expectedQuery));
    });

    it('builds query with type filter', () => {
      const query = buildGetAssistantWithFiltersQuery({ type: 'chat' });
      const expectedQuery = `
      SELECT a.* 
      FROM assistants a
      LEFT JOIN assistant_tags at ON a.id = at.assistant_id
      LEFT JOIN tags t ON at.tag_id = t.id
      WHERE a.type = 'chat'
    `;
      expect(normalizeWhitespace(query)).toBe(normalizeWhitespace(expectedQuery));
    });

    it('builds query with tags filter', () => {
      const query = buildGetAssistantWithFiltersQuery({ tags: ['ai', 'assistant'] });
      const expectedQuery = `
      SELECT a.* 
      FROM assistants a
      LEFT JOIN assistant_tags at ON a.id = at.assistant_id
      LEFT JOIN tags t ON at.tag_id = t.id
      WHERE t.name IN ('ai','assistant')
    `;
      expect(normalizeWhitespace(query)).toBe(normalizeWhitespace(expectedQuery));
    });

    it('builds query with type and tags filter', () => {
      const query = buildGetAssistantWithFiltersQuery({ type: 'chat', tags: ['ai', 'assistant'] });
      const expectedQuery = `
      SELECT a.* 
      FROM assistants a
      LEFT JOIN assistant_tags at ON a.id = at.assistant_id
      LEFT JOIN tags t ON at.tag_id = t.id
      WHERE a.type = 'chat' AND t.name IN ('ai','assistant')
    `;
      expect(normalizeWhitespace(query)).toBe(normalizeWhitespace(expectedQuery));
    });
  });
});
