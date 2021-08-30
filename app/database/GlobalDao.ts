import { Global } from '../utils/types';
import { globalTable } from '../constants/databaseNames.json';

export default async function getGlobal(): Promise<Global> {
    return window.database.general.selectFirst(globalTable);
}
