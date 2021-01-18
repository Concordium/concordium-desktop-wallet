import React from 'react';
import styles from './Multisignature.css';
import fs from 'fs';
import routes from '../../constants/routes.json';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { instanceOfAccountTransaction, instanceOfUpdateInstruction } from '../../utils/types';
import { ipcRenderer } from 'electron';

export default function BrowseTransactionFileView() {
    const dispatch = useDispatch();

    async function loadTransactionFile() {
        const openDialogValue: Electron.OpenDialogReturnValue = await ipcRenderer.invoke('OPEN_FILE_DIALOG', 'Load transaction');
        
        if (openDialogValue.canceled) {
            return;
        }

        if (openDialogValue.filePaths.length === 1) {
            const transactionFileLocation = openDialogValue.filePaths[0];
            const transactionString = fs.readFileSync(transactionFileLocation, { encoding: 'utf-8' });

            let transactionObject = undefined;
            try {
                transactionObject = JSON.parse(transactionString);
            } catch (e) {
                // TODO Replace thrown error with modal that tells the user that the provided file was invalid.
                throw new Error('Input was not valid JSON.');
            }
            
            if (!(instanceOfUpdateInstruction(transactionObject) || instanceOfAccountTransaction(transactionObject))) {
                // TODO Replace thrown error with modal that tells the user that the provided file was invalid.
                throw new Error('Invalid input!');
            }

            // The loaded file was valid, so proceed by loading the signing page for multi signature transactions.
            dispatch(push({ pathname: routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION, state: transactionObject }));
        }
    }

    return (
        <div className={styles.subbox}>
            <h1>Sign a transaction</h1>
            <p>Drag and drop proposed multi signature transaction here.</p>
            <div><button type="button" onClick={loadTransactionFile}>Browse to file</button></div>
        </div>
    );
}
