import React, { useEffect } from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import TransactionListElement from '../TransactionList/TransactionListElement';
import {
    TransferTransactionWithNames,
    TransactionStatus,
    StateUpdate,
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
    setTransaction: StateUpdate<TransferTransactionWithNames | undefined>;
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
            right={<CopyButton className={styles.copyButton} value={value} />}
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
function TransactionView({ transaction, onClose, setTransaction }: Props) {
    const transactions = useSelector(transactionsSelector);

    useEffect(() => {
        if (transaction) {
            const upToDateChosenTransaction = transactions.find(
                (t) => t.transactionHash === transaction.transactionHash
            );
            setTransaction(upToDateChosenTransaction);
        }
    }, [transactions, transaction, setTransaction]);

    return (
        <div className={styles.root}>
            <h3 className={styles.title}>Transaction details</h3>
            <CloseButton className={styles.closeButton} onClick={onClose} />
            <TransactionListElement
                className={styles.transactionListElement}
                style={{}}
                transaction={transaction}
                showDate
                showFullMemo
            />
            {displayRejectReason(transaction)}
            {!!transaction.fromAddress && (
                <CopiableListElement
                    title="From address:"
                    value={`${transaction.fromAddress}`}
                    note={transaction.fromName}
                />
            )}
            {transaction.toAddress ? (
                <CopiableListElement
                    title="To address:"
                    value={`${transaction.toAddress}`}
                    note={transaction.toName}
                />
            ) : null}
            <CopiableListElement
                title="Transaction hash"
                value={transaction.transactionHash || 'No transaction.'}
            />
            <CopiableListElement
                title="Block hash"
                value={transaction.blockHash || 'Awaiting finalization'}
            />
        </div>
    );
}

export default TransactionView;
