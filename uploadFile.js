import { storage } from './appwriteConfig';

const uploadFile = async (file) => {
  if (!file) return

  try {
    const response = await storage.createFile('67bc767d001e3dc0f566', 'unique()', file);
    const fileURL = storage.getFileView('67bc767d001e3dc0f566', response.$id);
    console.log('File available at', fileURL);
    return fileURL;
  } catch (error) {
    console.error('Upload failed', error);
    throw error;
  }
};

export default uploadFile;