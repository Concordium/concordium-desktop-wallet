import React from 'react';
import TransactionListElement from './TransactionListElement';
import CopiableListElement from './CopiableListElement';
import { TransferTransaction } from '../utils/types';
import styles from './Transaction.css';

interface Props {
    transaction: TransferTransaction;
    returnFunction: () => void;
}

function TransactionView({ transaction, returnFunction }: Props) {
    return (
        <div className={styles.transactionBox}>
            <div className={styles.centeredText}>
                <b>Transaction Details</b>
                <button
                    type="button"
                    className={styles.rightAlignedButton}
                    onClick={returnFunction}
                >
                    x
                </button>
            </div>
            <TransactionListElement transaction={transaction} />
            <CopiableListElement
                title="From Address:"
                value={transaction.fromAddress}
                note={transaction.fromAddressName}
            />
            <CopiableListElement
                title="To Address:"
                value={transaction.toAddress}
                note={transaction.toAddressName}
            />
            <CopiableListElement
                title="Transaction Hash"
                value={transaction.transactionHash}
            />
            <CopiableListElement
                title="Block Hash"
                value={transaction.blockHash}
            />
        </div>
    );
}

export default TransactionView;
