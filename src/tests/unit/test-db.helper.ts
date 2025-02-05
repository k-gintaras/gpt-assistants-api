import { DbHelper } from '../../database/database';

/**
 * its same as normal database, just didn't want to rewrite bunch of imports...
 */
export const getDb =
  process.env.NODE_ENV === 'test'
    ? new DbHelper(process.env.TEST_DB_NAME || 'gpt_assistants_test') // For testing, default to TEST_DB_NAME
    : new DbHelper(process.env.DB_NAME || 'gpt_assistants'); // For real DB, default to DB_NAME
