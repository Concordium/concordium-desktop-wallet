import React from 'react';
import { useSelector } from 'react-redux';
import { currentProposalSelector } from '../../features/MultiSignatureSlice';
import styles from './Multisignature.css';
import { MultiSignatureTransaction } from './UpdateMicroGtuPerEuro';
import fs from 'fs';

// TODO Do not use remote directly as it is unsafe. Use a custom IPC like for the database path stuff.
const { dialog } = require('electron').remote

/**
 * Component that displays the multi signature transaction proposal that is currently the
 * active one in the state.
 * 
 * The current transaction proposal is set either when generating a new transaction proposal,
 * or when selecting an existing transaction proposal from the multi signature transaction menu.
 */
export default function ProposalView() {
    const currentProposal: MultiSignatureTransaction | undefined = useSelector(currentProposalSelector);
    if (!currentProposal) {
        throw new Error('The proposal page should not be loaded without a proposal in the state.');
    }

    function exportTransaction() {
        dialog.showSaveDialog({ title: 'Export transaction' }).then(({ filePath }) => {
            if (filePath) {
                fs.writeFile(filePath, currentProposal.transaction, (err) => {
                    if (err) {
                        // TODO Better error handling here, or use the synchronous function.
                        console.error(`Unable to export transaction: ${err}`);
                    }
                });
            }
        }); 
    }

    // Implement a transaction summary that can dynamically display a proper summary of the 
    // transaction.

    return (
        <div className={styles.box}>
            <h1>Your transaction proposal</h1>
            <p>Your transaction proposal has been generated. An overview can be seen below.</p>
            <div className={styles.proposal}>
                <h3>Transaction Proposal | {currentProposal.type}</h3>
                <hr></hr>
                <div className={styles.column}><h3>{currentProposal.transaction}</h3></div>
                <div className={styles.column}>
                    <h3>Signature overview</h3>
                    <ul>    
                        <li><label>Awaiting signature<input type="checkbox"/></label></li>
                        <li><label>Awaiting signature<input type="checkbox"/></label></li>
                        <li><label>Awaiting signature<input type="checkbox"/></label></li>
                    </ul>
                </div>
                <div className={styles.column}><h3>Identicon and transaction hash</h3></div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.twocolumn}><button type="button" onClick={() => exportTransaction()}>Export transaction proposal</button></div>
                <div className={styles.twocolumn}><button type="button">Submit transaction to chain</button></div>
            </div>
        </div>
    )
}
