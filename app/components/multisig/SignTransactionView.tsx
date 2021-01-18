import React, { useState } from 'react';
import styles from './Multisignature.css';
import { hashSha256 } from '../../utils/serializationHelpers';
import LedgerComponent from '../ledger/LedgerComponent';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import TransactionDetails from './TransactionDetails';
import TransactionHashView from './TransactionHashView';
import routes from './../../constants/routes.json';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { TransactionHandler } from '../../utils/types';
import { UpdateInstructionHandler } from './UpdateInstructionHandler';

const transactionHandlers: TransactionHandler<any>[] = [
    new UpdateInstructionHandler(),
    // TODO Replace with AccountTransactionHandler() when implemented.
    new UpdateInstructionHandler()
]

export default function SignTransactionView(props) {
    const [cosign, setCosign] = useState(false);
    const [hashMatches, setHashMatches] = useState(false);
    const [pictureMatches, setPictureMatches] = useState(false);
    const [transactionDetailsAreCorrect, setTransactionDetailsAreCorrect] = useState(false);

    const dispatch = useDispatch();
    let transaction = props.location.state;
    
    // TODO: Dynamically choose the correct transaction handler.
    const transactionHandler = transactionHandlers.find(handler => handler.instanceOf(transaction));
    if (!transactionHandler) {
        throw new Error('No transaction handler was found. An invalid transaction has been received.');
    }

    let serializedTransaction = transactionHandler.serializeTransaction(transaction);
    let transactionHash = hashSha256(serializedTransaction).toString('hex');

    async function signingFunction(ledger: ConcordiumLedgerClient) {
        let signature = await transactionHandler.signTransaction(ledger, transaction);
        let signatureAsHex = signature.toString('hex');

        // Load the page for exporting the signed transaction.
        dispatch(push({ pathname: routes.MULTISIGTRANSACTIONS_EXPORT_TRANSACTION, state: { transaction, transactionHash, signatureAsHex }}));
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
