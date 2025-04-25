import { Client, Databases, Account, Storage } from 'appwrite';

const client = new Client();

client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67bc6c700000d69de38b');

const databases = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);

export { databases, account, storage };