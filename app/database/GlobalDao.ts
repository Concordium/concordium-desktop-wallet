import { Global } from '../utils/types';
import { globalTable } from '../constants/databaseNames.json';
import ipcCommands from '~/constants/ipcCommands.json';

export default async function getGlobal(): Promise<Global> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.selectFirst,
        globalTable
    );
}
