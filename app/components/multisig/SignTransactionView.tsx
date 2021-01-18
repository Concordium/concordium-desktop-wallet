import React, { useState } from 'react';
import styles from './Multisignature.css';
import { serializeUpdateInstruction } from '../../utils/UpdateSerialization';
import { hashSha256 } from '../../utils/serializationHelpers';
import LedgerComponent from '../ledger/LedgerComponent';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import TransactionDetails from './TransactionDetails';
import TransactionHashView from './TransactionHashView';
import routes from './../../constants/routes.json';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { instanceOfAccountTransaction, instanceOfUpdateInstruction } from '../../utils/types';

export default function SignTransactionView(props) {
    const [cosign, setCosign] = useState(false);
    const [hashMatches, setHashMatches] = useState(false);
    const [pictureMatches, setPictureMatches] = useState(false);
    const [transactionDetailsAreCorrect, setTransactionDetailsAreCorrect] = useState(false);

    const dispatch = useDispatch();

    let transaction = props.location.state;
    let serializedTransaction = undefined;
    if (instanceOfUpdateInstruction(transaction)) {
        serializedTransaction = serializeUpdateInstruction(transaction);
    } else if (instanceOfAccountTransaction(transaction)) {
        // TODO Add serialization code for account transaction.
        throw new Error('Not implemented yet.');
    } else {
        throw new Error(`An invalid transaction was provided to the component: ${transaction}`);
    }
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
    if (cosign) {
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
                        <li><label>The hash matches the one received externally<input type="checkbox" defaultChecked={hashMatches} onChange={() => setHashMatches(!hashMatches)} /></label></li>
                        <li><label>The picture matches the one received externally<input type="checkbox" defaultChecked={pictureMatches} onChange={() => setPictureMatches(!pictureMatches)} /></label></li>
                        <li><label>The transaction details are correct<input type="checkbox" defaultChecked={transactionDetailsAreCorrect} onChange={() => setTransactionDetailsAreCorrect(!transactionDetailsAreCorrect)}/></label></li>
                    </ul>
                </div>
                <button type="button" onClick={() => setCosign(true)} disabled={cosign || !hashMatches || !pictureMatches || !transactionDetailsAreCorrect}>
                    Co-sign
                </button>
            </div>
            {ledgerComponent}
        </div>
    );
}
