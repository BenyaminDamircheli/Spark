import { ipcMain } from "electron";
import memoIndex from "../utils/memoIndex";

ipcMain.handle('index-load', async (event, memoPath: string) => {
  const index = await memoIndex.load(memoPath);
  return index;
});

ipcMain.handle('index-get', async (event) => {
    return memoIndex.getIndex();
})

ipcMain.handle('index-regenerate-embeddings', async(event) => {
    return memoIndex.regenerateEmbeddings();
})

ipcMain.handle('index-add', (event, filePath) => {
    const index = memoIndex.add(filePath);
    return index;
});
  
ipcMain.handle('index-update', (event, filePath, data) => {
  try {
    const index = memoIndex.update(filePath, data);
    console.log('Index updated successfully');
    return index;
  } catch (error) {
    console.error('Error updating index:', error);
    throw error;
  }
});
  
ipcMain.handle('index-search', (event, query) => {
    const results = memoIndex.search(query);
    return results;
});
  
ipcMain.handle('index-vector-search', (event, query, topN = 50) => {
    const results = memoIndex.vectorSearch(query);
    return results;
});
  
ipcMain.handle('index-get-threads-as-text', (event, filePaths = []) => {
    const results = [];
  
    for (const filePath of filePaths) {
      const entry = memoIndex.getThreadAsText(filePath);
      results.push(entry);
    }
    return results;
});
  
ipcMain.handle('index-remove', (event, filePath) => {
    const index = memoIndex.remove(filePath);
    return index;
});