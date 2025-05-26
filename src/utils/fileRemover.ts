import fs from 'fs';
import path from 'path';

/**
 * Removes a single file or multiple files from the server.
 * @param filePaths - A string or an array of strings representing file paths to remove.
 */
const fileRemover = async (filePaths: string | string[]): Promise<void> => {
  const filesToRemove = Array.isArray(filePaths) ? filePaths : [filePaths];

  for (const filePath of filesToRemove) {
    const absolutePath = path.resolve(filePath); // Resolve to absolute path
    try {
      if (fs.existsSync(absolutePath)) {
        await fs.promises.unlink(absolutePath);
        // console.log(`File removed: ${absolutePath}`);
      } else {
        console.warn(`File not found: ${absolutePath}`);
      }
    } catch (error) {
      console.error(`Error removing file: ${absolutePath}`, error);
    }
  }
};

export default fileRemover;