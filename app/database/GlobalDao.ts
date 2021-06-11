import { Global } from '../utils/types';
import { globalTable } from '../constants/databaseNames.json';

export default async function getGlobal(): Promise<Global> {
    return window.ipcRenderer.invoke('dbSelectFirst', globalTable);
}
