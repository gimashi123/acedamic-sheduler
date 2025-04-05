// Academic Scheduler Setup Script
// This script runs all the data generation processes without creating admin accounts or timetables

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

// Setup path for scripts
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to execute a script and return a promise
function executeScript(scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`\n===== RUNNING ${scriptName} =====\n`);
    
    const scriptPath = path.join(__dirname, scriptName);
    const child = spawn('node', [scriptPath], { stdio: 'inherit' });
    
    child.on('close', code => {
      if (code === 0) {
        console.log(`\n✅ ${scriptName} completed successfully\n`);
        resolve();
      } else {
        console.error(`\n❌ ${scriptName} failed with code ${code}\n`);
        reject(new Error(`Script ${scriptName} exited with code ${code}`));
      }
    });
    
    child.on('error', err => {
      console.error(`\n❌ Failed to start ${scriptName}: ${err}\n`);
      reject(err);
    });
  });
}

// Main function to run all scripts in sequence
async function setupAcademicScheduler() {
  try {
    console.log('\n🚀 STARTING ACADEMIC SCHEDULER SETUP\n');
    
    // Generate sample data (without admin accounts)
    await executeScript('sample-data.js');
    
    console.log('\n✨ SAMPLE DATA SETUP COMPLETED SUCCESSFULLY ✨\n');
    console.log('Next steps:');
    console.log('1. Create an admin account through the application');
    console.log('2. Log in as admin and generate timetables');
    console.log('\nReminder:');
    console.log('- Start backend: cd ../ && npm run dev');
    console.log('- Start frontend: cd ../../frontend && npm run dev');
    
  } catch (error) {
    console.error('\n❌ SETUP FAILED:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupAcademicScheduler(); 