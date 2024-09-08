import { ipcMain } from "electron";
import memoCategory from "../utils/memoCategory";

ipcMain.handle('categories-load', (event, memoPath) => {
    return memoCategory.load(memoPath);
})

ipcMain.handle('categories-delete', (event, categoryName) => {
    return memoCategory.deleteCategory(categoryName);
})

ipcMain.handle('categories-get', (event) => {
    return memoCategory.getCategories();
})

ipcMain.handle('categories-create', (event, categoryName) => {
    memoCategory.createCategory(categoryName);
})


