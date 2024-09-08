import { ipcMain } from 'electron';
import keytar from 'keytar';

ipcMain.handle('get-ai-key', async () => {
  return await keytar.getPassword('Twine', 'aikey');
});

ipcMain.handle('set-ai-key', async (event, secretKey) => {
  return await keytar.setPassword('Twine', 'aikey', secretKey);
});

ipcMain.handle('delete-ai-key', async () => {
  return await keytar.deletePassword('Twine', 'aikey');
});