import { Client, Databases } from 'appwrite';
import fs from 'fs';

// Initialize the Appwrite client
const client = new Client();
client
  .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite Endpoint
  .setProject('67bc6c700000d69de38b'); // Your project ID

// Initialize the Databases service
const databases = new Databases(client);

// Read the JSON file
const questions = JSON.parse(fs.readFileSync('questions.json', 'utf8'));

// Function to insert data
const insertData = async () => {
  for (const question of questions) {
    try {
      await databases.createDocument(
        '67bc7a3300045b341a68', // Database ID
        '67bc7a60002cea5f0f06', // Collection ID
        question.documentId, // Custom document ID
        question.data, // Document data
        [
          'read("any")', // Read permission for anyone
          'write("any")' // Write permission for anyone
        ]
      );
      console.log(`Document ${question.documentId} added successfully`);
    } catch (error) {
      console.error(`Failed to add document ${question.documentId}:`, error);
    }
  }
};

// Run the function
insertData();