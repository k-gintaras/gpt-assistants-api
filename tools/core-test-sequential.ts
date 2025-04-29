import { promisify } from 'util';
import { exec } from 'child_process'; // Use ES Modules import here

// Convert exec to return a promise
const execPromise = promisify(exec);

// Array of test folders you want to run sequentially
const testFolders = ['tests/unit/gpt-tests', 'tests/unit/orchestrator-tests', 'tests/unit/other-tests', 'tests/unit/server-tests', 'tests/unit/service-tests', 'tests/unit/transformer-tests'];

// Function to run Jest on each folder sequentially
async function runTestsInSequence(folders: string[]) {
  for (const currentFolder of folders) {
    try {
      console.log(`Running tests in folder: ${currentFolder}`);
      const { stdout, stderr } = await execPromise(`jest ${currentFolder}`);

      if (stderr) {
        console.error(`Error running tests in ${currentFolder}:`, stderr);
      }

      console.log(stdout);
    } catch (error) {
      console.error(`Error running tests in ${currentFolder}:`, error);
      break; // Stop the sequence if an error occurs
    }
  }

  console.log('All tests completed.');
}

// Start the test execution
runTestsInSequence(testFolders);
