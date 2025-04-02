import { Client, Databases } from 'appwrite';
import fs from 'fs';

const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67bc6c700000d69de38b');

const databases = new Databases(client);

// Read the JSON file
const scenarios = JSON.parse(fs.readFileSync('scenarios.json', 'utf8'));
console.log(`Found ${scenarios.length} scenarios to insert`);

const insertScenarios = async () => {
  for (const scenario of scenarios) {
    try {
      // Create a document with the required fields
      const scenarioToInsert = {
        scenarioId: scenario.scenarioId,
        title: scenario.title || `Scenario ${scenario.scenarioId}`, // Add title if exists
        steps: JSON.stringify(scenario.steps) // Convert steps array to string
      };
      
      console.log(`Inserting scenario: ${scenario.scenarioId}`);
      // Print the size of the JSON string to debug potential length issues
      console.log(`JSON string length: ${scenarioToInsert.steps.length} characters`);
      
      await databases.createDocument(
        '67bc7a3300045b341a68', 
        '67defbef001da3c2962a',
        scenario.scenarioId,
        scenarioToInsert
      );
      console.log(`✅ Scenario ${scenario.scenarioId} added successfully`);
    } catch (error) {
      console.error(`❌ Failed to add scenario ${scenario.scenarioId}:`);
      console.error(error);
      
      // Additional error details
      if (error.response) {
        console.error(`Error code: ${error.response.code}`);
        console.error(`Error message: ${error.response.message}`);
      }
    }
  }
};

// Run the function and handle any errors
insertScenarios()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err));