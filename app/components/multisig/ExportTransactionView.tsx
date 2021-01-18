import React from 'react';
import styles from './Multisignature.css';
import TransactionDetails from './TransactionDetails';
import TransactionHashView from './TransactionHashView';
import { UpdateInstruction } from '../../utils/types';
import fs from 'fs';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import routes from './../../constants/routes.json';

// TODO Do not use remote directly as it is unsafe. Use a custom IPC like for the database path stuff.
const { dialog } = require('electron').remote

/**
 * Component that contains a button for exporting the signed transaction that is 
 * currently being processed. 
 */
export default function ExportTransactionView(props) {
    const dispatch = useDispatch();
    
    const signature = props.location.state.signature;
    const updateInstruction: UpdateInstruction = props.location.state.transaction;
    const transactionHash = props.location.state.transactionHash;

    function exportSignedTransaction() {
        const signedTransaction = {
            ...updateInstruction,
            signatures: [signature]
        }
        const signedTransactionJson = JSON.stringify(signedTransaction);

        dialog.showSaveDialog({ title: 'Export signed transaction' }).then(({ filePath }) => {
            if (filePath) {
                fs.writeFile(filePath, signedTransactionJson, (err) => {
                    if (err) {
                        // TODO Better error handling here, or use the synchronous function.
                        console.error(`Unable to export transaction: ${err}`);
                    }

                    // Navigate back to the multi signature front page.
                    dispatch(push({ pathname: routes.MULTISIGTRANSACTIONS}));
                });
            }
        }); 
    }

    return (
        <div>
            <div className={styles.subbox}>
                <h3>Transaction signing confirmation | Transaction Type</h3>
                <hr></hr>
                <TransactionDetails updateInstruction={updateInstruction} />
                <TransactionHashView transactionHash={transactionHash} />
                <div>
                    <ul>    
                        <li><label>The hash matches the one received externally<input type="checkbox"/></label></li>
                        <li><label>The picture matches the one received externally<input type="checkbox"/></label></li>
                        <li><label>The transaction details are correct<input type="checkbox"/></label></li>
                    </ul>
                </div>
                <button type="button" onClick={exportSignedTransaction}>Export signed transaction</button>
            </div>
        </div>
    );
}
