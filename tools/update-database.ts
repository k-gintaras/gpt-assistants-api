import { getDb } from '../src/database/database';

const dbHelper = getDb();
dbHelper
  .updateDatabases('../src/database/update-0_2.sql')
  .then(() => {
    console.log('Database update completed successfully.');
  })
  .catch((error) => {
    console.error('Error during database update:', error);
  });
