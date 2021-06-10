import ipcCommands from '../../constants/ipcCommands.json';

/**
 * Checks whether the database has already been created or not.
 * We cannot just check whether the file exists, as the knex configuration
 * will have created an empty file, therefore the check actually checks
 * whether the file has a non-empty size.
 */
export default async function databaseExists(): Promise<boolean> {
    return window.ipcRenderer.invoke(ipcCommands.databaseExists);
}
