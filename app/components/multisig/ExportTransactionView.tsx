import React from 'react';
import styles from './Multisignature.css';
import TransactionDetails from './TransactionDetails';
import TransactionHashView from './TransactionHashView';
import { UpdateInstruction } from '../../utils/types';
import fs from 'fs';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import routes from './../../constants/routes.json';
import { ipcRenderer } from 'electron';

/**
 * Component that contains a button for exporting the signed transaction that is 
 * currently being processed.
 */
export default function ExportTransactionView(props) {
    const dispatch = useDispatch();

    const signature = props.location.state.signature;
    const updateInstruction: UpdateInstruction = props.location.state.transaction;
    const transactionHash = props.location.state.transactionHash;

    async function exportSignedTransaction() {
        const signedTransaction = {
            ...updateInstruction,
            signatures: [signature]
        }
        const signedTransactionJson = JSON.stringify(signedTransaction);
        
        const saveFileDialog: Electron.SaveDialogReturnValue = await ipcRenderer.invoke('SAVE_FILE_DIALOG', 'Export signed transaction');
        if (saveFileDialog.canceled) {
            return;
        }

        if (saveFileDialog.filePath) {
            fs.writeFile(saveFileDialog.filePath, signedTransactionJson, (err) => {
                if (err) {
                    // TODO Better error handling here.
                    console.error(`Unable to export transaction: ${err}`);
                }

                // Navigate back to the multi signature front page.
                dispatch(push({ pathname: routes.MULTISIGTRANSACTIONS}));
            });
        }
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
                        <li><label>The hash matches the one received externally<input type="checkbox" defaultChecked={true} disabled={true} /></label></li>
                        <li><label>The picture matches the one received externally<input type="checkbox" defaultChecked={true} disabled={true}/></label></li>
                        <li><label>The transaction details are correct<input type="checkbox" defaultChecked={true} disabled={true}/></label></li>
                    </ul>
                </div>
                <button type="button" onClick={exportSignedTransaction}>Export signed transaction</button>
            </div>
        </div>
    );
}
