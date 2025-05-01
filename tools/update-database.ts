import { getTestDb, getProductionDb } from '../src/database/database';

const updateFile = './update-0_2.sql'; // ! its in same folder as database helper !!!
// Function to initialize a given database (test or production)
// async function initializeDatabase(dbHelper: DbHelper) {
//   console.log(`Initializing database: ${dbHelper['databaseName']}`);
//   await dbHelper.initialize(); // Initialize the database (create tables, etc.)
// }

// Function to update both test and production databases
async function updateDatabases() {
  const testDb = getTestDb();
  const prodDb = getProductionDb();

  // Initialize both test and production databases
  // await initializeDatabase(testDb);
  // await initializeDatabase(prodDb);

  try {
    //   // Run update on the test database
    await testDb.runUpdateOnDatabase(testDb, updateFile);
    await prodDb.runUpdateOnDatabase(prodDb, updateFile);

    await testDb.close();
    await prodDb.close();

    console.log('Database updates completed successfully.');
  } catch (error) {
    console.error('Error during database update:', error);
  }
}

// Start the database update process
updateDatabases();
