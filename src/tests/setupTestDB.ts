import { Pool } from 'pg';
import { getDb } from './unit/test-db.helper';

const db: Pool = getDb.getInstance();

beforeEach(async () => {
  await db.query('BEGIN');
});

afterEach(async () => {
  await db.query('ROLLBACK');
});
