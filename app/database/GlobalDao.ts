import { Global } from '../utils/types';
import databaseNames from '../constants/databaseNames.json';

export default async function getGlobal(): Promise<Global> {
    return window.database.general.selectFirst(databaseNames.globalTable);
}
