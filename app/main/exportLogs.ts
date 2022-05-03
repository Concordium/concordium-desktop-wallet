import fs from 'fs';
import { getUserDataPath, saveFileDialog } from './ipcHandlers';
import logConstants from '~/constants/logConstants.json';

export default async function exportLogs(): Promise<boolean> {
    const dialogResult = await saveFileDialog({
        title: 'Export logs',
        defaultPath: logConstants.fileName,
    });
    const location = dialogResult.filePath;
    if (!location) {
        return false;
    }

    const userDataPath = getUserDataPath();
    const extraFileLocation = `${userDataPath}/${logConstants.extraFileName}`;
    // We only add the first extra log file. This should be rewritten to append multiple.
    try {
        fs.accessSync(extraFileLocation);
        try {
            fs.copyFileSync(extraFileLocation, location);
        } catch {
            return false;
        }
    } catch {
        // If we don't have access to the extra file, accessSync will throw an error.
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
