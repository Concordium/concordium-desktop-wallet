import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import TransactionListElement from '../TransactionList/TransactionListElement';
import {
    TransferTransactionWithNames,
    TransactionStatus,
    TransferTransaction,
} from '~/utils/types';
import { isFailed } from '~/utils/transactionHelpers';
import SidedRow from '~/components/SidedRow';
import CopyButton from '~/components/CopyButton';
import { rejectReasonToDisplayText } from '~/utils/node/RejectReasonHelper';
import { transactionsSelector } from '~/features/TransactionSlice';
import styles from './TransactionView.module.scss';
import CloseButton from '~/cross-app-components/CloseButton';

interface Props {
    transaction: TransferTransactionWithNames;
    onClose?(): void;
}

interface CopiableListElementProps {
    title: string;
    value: string;
    note?: string;
}

/**
 * This Display the title (and the note) and contains an CopyButton, that, when pressed, copies the given value into the user's clipboard.
 */
function CopiableListElement({
    title,
    value,
    note,
}: CopiableListElementProps): JSX.Element {
    return (
        <SidedRow
            className={styles.listElement}
            left={
                <div className={styles.copiableListElementLeftSide}>
                    <p className={styles.copiableListElementTitle}>{title}</p>
                    {'\n'}
                    <p className="body4 m0 mT5">
                        {value} {note ? `(${note})` : undefined}
                    </p>
                </div>
            }
            right={<CopyButton value={value} />}
        />
    );
}

function displayRejectReason(transaction: TransferTransactionWithNames) {
    if (isFailed(transaction)) {
        return (
            <p className={clsx(styles.errorMessage, 'mT0')}>
                Failed:{' '}
                {transaction.status === TransactionStatus.Rejected
                    ? 'Transaction was rejected'
                    : rejectReasonToDisplayText(transaction.rejectReason)}
            </p>
        );
    }
    return null;
}

/**
 * Detailed view of the given transaction.
 */
function TransactionView({ transaction, onClose }: Props) {
    const transactions = useSelector(transactionsSelector);
    const [
        chosenTransaction,
        setChosenTransaction,
    ] = useState<TransferTransaction>(transaction);

    useEffect(() => {
        if (chosenTransaction) {
            const upToDateChosenTransaction = transactions.find(
                (t) => t.transactionHash === chosenTransaction.transactionHash
            );
            if (upToDateChosenTransaction) {
                setChosenTransaction(upToDateChosenTransaction);
            }
        }
    }, [transactions, chosenTransaction, setChosenTransaction]);

    return (
        <div className={styles.root}>
            <h3 className={styles.title}>Transaction details</h3>
            <CloseButton className={styles.closeButton} onClick={onClose} />
            <TransactionListElement
                className={styles.fillCardPadding}
                style={{}}
                transaction={transaction}
                showDate
                showFullMemo
            />
            {displayRejectReason(transaction)}
            {!!transaction.fromAddress && (
                <CopiableListElement
                    title="From Address:"
                    value={`${transaction.fromAddress}`}
                    note={transaction.fromName}
                />
            )}
            {transaction.toAddress ? (
                <CopiableListElement
                    title="To Address:"
                    value={`${transaction.toAddress}`}
                    note={transaction.toName}
                />
            ) : null}
            <CopiableListElement
                title="Transaction Hash"
                value={transaction.transactionHash || 'No Transaction.'}
            />
            <CopiableListElement
                title="Block Hash"
                value={transaction.blockHash || 'Awaiting finalization'}
            />
        </div>
    );
}

export default TransactionView;
