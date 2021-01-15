import React from 'react';
import styles from './Multisignature.css';
import fs from 'fs';
import routes from '../../constants/routes.json';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';

// TODO Do not use remote directly as it is unsafe. Use a custom IPC like for the database path stuff.
// This automatically makes it all async as far as I recall.
const { dialog } = require('electron').remote

export default function BrowseTransactionFileView() {
    const dispatch = useDispatch();

    // TODO Perhaps this should be using async methods instead of the synchronous ones?
    function openFile() {
        const transactionFileLocationResult = dialog.showOpenDialogSync({ title: 'Open transaction'});
        if (transactionFileLocationResult && transactionFileLocationResult.length === 1) {
            const transactionFileLocation = transactionFileLocationResult[0];
            const transaction = fs.readFileSync(transactionFileLocation, { encoding: 'utf-8' });

            // Load the signing page for multi signature transactions.
            dispatch(push({ pathname: routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION, state: transaction }));
        }
    }

    return (
        <div className={styles.subbox}>
            <h1>Sign a transaction</h1>
            <p>Drag and drop proposed multi signature transaction here.</p>
            <div><button type="button" onClick={() => openFile()}>Browse to file</button></div>
        </div>
    );
}
