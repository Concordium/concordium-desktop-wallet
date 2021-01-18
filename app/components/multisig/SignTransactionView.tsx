import React, { useState } from 'react';
import styles from './Multisignature.css';
import { UpdateInstruction } from './UpdateMicroGtuPerEuro';
import { serializeUpdateInstruction } from '../../utils/UpdateSerialization';
import { hashSha256 } from '../../utils/serializationHelpers';
import LedgerComponent from '../ledger/LedgerComponent';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import TransactionDetails from './TransactionDetails';
import TransactionHashView from './TransactionHashView';
import routes from './../../constants/routes.json';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';

// TODO:
//      1. Do not allow a user to sign if the checkboxes are not checked off.

export default function SignTransactionView(props) {
    const [cosigned, setCosigned] = useState(false);
    const dispatch = useDispatch();

    // TODO Validate the input and display an error to the user if the input could not be parsed.
    // Remember that we also have to support account transactions here.
    
    // TODO The transaction type is required at this point.
    const transaction: UpdateInstruction = JSON.parse(props.location.state);
    let serializedTransaction = serializeUpdateInstruction(transaction);
    let transactionHash = hashSha256(serializedTransaction).toString('hex');
    
    async function signingFunction(ledger: ConcordiumLedgerClient) { 
        // TODO Choice of signing function has to be dynamic here, but they should all return a signature in the same format that is forwarded to the export page.
        const signature = (await ledger.getPrfKey(0)).toString('hex');

        // Load the page for exporting the signed transaction.
        dispatch(push({ pathname: routes.MULTISIGTRANSACTIONS_EXPORT_TRANSACTION, state: { transaction, transactionHash, signature } }));
    }

    // The device component should only be displayed if the user has clicked
    // to co-sign the transaction.
    let ledgerComponent;
    if (cosigned) {
        ledgerComponent = <LedgerComponent ledgerCall={signingFunction}/>;
    } else {
        ledgerComponent = null;
    }
    
    return (
        <div>
            <div className={styles.subbox}>
                <h3>Transaction signing confirmation | Transaction Type</h3>
                <hr></hr>
                <TransactionDetails updateInstruction={transaction} />
                <TransactionHashView transactionHash={transactionHash} />
                <div>
                    <ul>    
                        <li><label>The hash matches the one received externally<input type="checkbox"/></label></li>
                        <li><label>The picture matches the one received externally<input type="checkbox"/></label></li>
                        <li><label>The transaction details are correct<input type="checkbox"/></label></li>
                    </ul>
                </div>
                <button type="button" onClick={() => setCosigned(true)} disabled={cosigned}>
                    Co-sign
                </button>
            </div>
            {ledgerComponent}
        </div>
    );
}
