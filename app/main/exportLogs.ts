import fs from 'fs';
import { getUserDataPath, saveFileDialog } from './ipcHandlers';
import logConstants from '~/constants/logConstants.json';

export default async function exportLogs(): Promise<boolean> {
    const dialogResult = await saveFileDialog({
        title: 'Export logs',
        defaultPath: fileName,
    });
    const location = dialogResult.filePath;
    if (!location) {
        return false;
    }

    const userDataPath = getUserDataPath();
    const extraFileLocation = `${userDataPath}/${logConstants.extraFileName}`;
    // We only add the first extra log file. This should be rewritten to append multiple.
    if (fs.accessSync(extraFileLocation)) {
        try {
            fs.copyFileSync(extraFileLocation, location);
        } catch {
            return false;
        }
    }

    try {
        const extra = fs.readFileSync(
            `${userDataPath}/${logConstants.fileName}`
        );
        fs.appendFileSync(location, extra);
    } catch {
        return false;
    }
    return true;
}
