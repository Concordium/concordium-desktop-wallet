import { genesisTable } from '../constants/databaseNames.json';
import { Genesis } from './types';
import ipcCommands from '~/constants/ipcCommands.json';

export default async function getGenesis(): Promise<Genesis> {
    return window.ipcRenderer.invoke(
        ipcCommands.database.selectFirst,
        genesisTable
    );
}
