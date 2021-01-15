import React from 'react';
import styles from './Multisignature.css';
import { UpdateInstruction } from './UpdateMicroGtuPerEuro';
import { serializeUpdateInstruction } from '../../utils/UpdateSerialization';
import { hashSha256 } from '../../utils/serializationHelpers';

export default function SignTransactionView(props) {
    // TODO Validate the input and display an error to the user if the input could not be parsed.
    // Remember that we also have to support account transactions here.
    // TODO The transaction type is required at this point.
    const transaction: UpdateInstruction = JSON.parse(props.location.state);

    let serializedTransaction = serializeUpdateInstruction(transaction);
    let transactionHash = hashSha256(serializedTransaction).toString('hex');
    // TODO Compute identicon on the hash and display it.
    
    // TODO Add button for signing the transaction (Ledger flow, based on the transaction type).
    // After signing an export button is available to export the signature.

    // Howto match the transaction when going back to the proposer? It could automatically find the transaction
    // with an equal hash. Perhaps not needed for MVP.

    return (
        <div className={styles.subbox}>
            <h3>Transaction signing confirmation | Transaction Type</h3>
            <hr></hr>
            <div className={styles.twocolumn}><h3>Transaction overview</h3>{JSON.stringify(transaction.payload)}</div>
            <div className={styles.twocolumn}><h3>Transaction Identicon</h3><p>Transaction hash {transactionHash}</p></div>
        </div>
    );
}
