import { ipcMain } from 'electron';
import memoBookmarks from '../utils/memoBookmarks';
import { getBookmarkPreview, getBookmarkContent } from '../utils/memoBookmarkPreview';


ipcMain.handle('bookmarks-get', (event, memoPath, url) =>{
    const data = memoBookmarks.get(memoPath, url);
    console.log('data', data);
    return data || null;
})

ipcMain.handle('bookmarks-get-all', (event) =>{
    const data = memoBookmarks.getAllBookmarks();
    return data;
})

ipcMain.handle('bookmarks-set', (event, memoPath, url, data) =>{
    memoBookmarks.set(memoPath, url, data);
})

ipcMain.handle('get-bookmark-preview', async (event, url) =>{
    try{
        return await getBookmarkPreview(url);
    } catch (error) {
        console.error('Error in get-bookmark-preview:', error);
        return null;
    }
})

ipcMain.handle('get-bookmark-content', async (event, url) =>{
    try{
        return await getBookmarkContent(url);
    } catch (error) {
        return null;
    }
})
