/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getDb } from "../database/database";

// Ensure tests run in test environment
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

const db = getDb();

// Save client per test in global symbol
declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var __TEST_DB_CLIENT__: any;
}

beforeAll(async () => {
  // Initialize schema in pg-mem
  await db.initialize();
});

beforeEach(async () => {
  // Start transaction for test isolation
  const client = await db.getInstance().connect();
  await client.query('BEGIN');
  // store it on global so afterEach can access
  (global as any).__TEST_DB_CLIENT__ = client;
});

afterEach(async () => {
  const client = (global as any).__TEST_DB_CLIENT__;
  if (client) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore
    } finally {
      client.release();
      delete (global as any).__TEST_DB_CLIENT__;
    }
  }
});

afterAll(async () => {
  try {
    await db.close();
  } catch {
    // ignore
  }
});
