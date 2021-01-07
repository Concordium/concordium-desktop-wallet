import React from 'react';
import TransactionListElement from './TransactionListElement';
import CopiableListElement from './CopiableListElement';
import { Transaction } from '../utils/types';

interface Props {
    transaction: Transaction;
    returnFunction: () => void;
}

function TransactionView({ transaction, returnFunction }: Props) {
    return (
        <div>
            Transaction Details
            <button type="button" onClick={returnFunction}>
                x
            </button>
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
