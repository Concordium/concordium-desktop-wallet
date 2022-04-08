import fs from 'fs';
import { getUserDataPath, saveFileDialog } from './ipcHandlers';
import { fileName, extraFileName } from '~/constants/logConstants.json';

export default async function exportLogs() {
    const dialogResult = await saveFileDialog({
        title: 'Export logs',
        defaultPath: fileName,
    });
    const location = dialogResult.filePath;
    if (!location) {
        return;
    }

    const userDataPath = getUserDataPath();
    // We only add the first extra log file. This should be rewritten to append multiple.
    fs.copyFileSync(`${userDataPath}/${extraFileName}`, location);

    const extra = fs.readFileSync(`${userDataPath}/${fileName}`);
    fs.appendFileSync(location, extra);
}
