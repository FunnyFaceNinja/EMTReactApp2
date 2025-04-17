import { Client, Storage } from 'appwrite';

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67bc6c700000d69de38b');

const storage = new Storage(client);

// Bucket ID for CPG files
const CPG_BUCKET_ID = '67bc767d001e3dc0f566';

// Define sections with their names and CPG counts
export interface CPGSection {
  name: string;
  count: number;
}

export const CPG_SECTIONS: Record<string, CPGSection> = {
  '13': { name: 'Paediatrics', count: 30 },
  '14': { name: 'Trauma', count: 25 },
  // Add more sections as needed
};

export const appwriteService = {
  // Get CPG URL by section and number
  getCPGUrl: (section: string, cpgNumber: string) => 
    `https://cloud.appwrite.io/v1/storage/buckets/${CPG_BUCKET_ID}/files/section${section}_cpg${cpgNumber}/view?project=67bc6c700000d69de38b`,
  
  // Get all CPG sections
  getCPGSections: () => CPG_SECTIONS
};
