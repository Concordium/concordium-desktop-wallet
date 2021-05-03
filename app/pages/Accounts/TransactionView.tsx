import React from 'react';
import TransactionListElement from './TransactionListElement';
import { TransferTransaction } from '../../utils/types';
import { isFailed } from '../../utils/transactionHelpers';
import CloseButton from '~/cross-app-components/CloseButton';
import Card from '~/cross-app-components/Card';
import SidedRow from '~/components/SidedRow';
import CopyButton from '~/components/CopyButton';
import styles from './TransactionView.module.scss';

interface Props {
    transaction: TransferTransaction;
    returnFunction: () => void;
}

interface CopiableListElementProps {
    title: string;
    value: string;
    note?: string;
    className?: string;
}

/**
 * This Display the title (and the note) and contains an CopyButton, that, when pressed, copies the given value into the user's clipboard.
 */
function CopiableListElement({
    title,
    value,
    note,
    className,
}: CopiableListElementProps): JSX.Element {
    return (
        <SidedRow
            className={className}
            left={
                <div className={styles.copiableListElementLeftSide}>
                    <p className={styles.copiableListElementTitle}>{title}</p>
                    {'\n'}
                    <p className={styles.copiableListElementValue}>
                        {value} {note ? `(${note})` : undefined}
                    </p>
                </div>
            }
            right={<CopyButton value={value} />}
        />
    );
}

function displayRejectReason(transaction: TransferTransaction) {
    if (isFailed(transaction)) {
        return (
            <p className={styles.errorMessage}>
                Failed:{' '}
                {transaction.rejectReason || 'Unknown reason for failure'}
            </p>
        );
    }
    return null;
}

/**
 * Detailed view of the given transaction.
 */
function TransactionView({ transaction, returnFunction }: Props) {
    return (
        <Card className={styles.transactionView}>
            <h2 className={styles.title}> Transaction Details </h2>
            <CloseButton
                className={styles.closeButton}
                onClick={returnFunction}
            />
            <TransactionListElement transaction={transaction} />
            {displayRejectReason(transaction)}
            <CopiableListElement
                title="From Address:"
                className={styles.listElement}
                value={`${transaction.fromAddress.substring(0, 8)}...`}
                note={transaction.fromAddressName}
            />
            <CopiableListElement
                title="To Address:"
                className={styles.listElement}
                value={`${transaction.toAddress.substring(0, 8)}...`}
                note={transaction.toAddressName}
            />
            <CopiableListElement
                className={styles.listElement}
                title="Transaction Hash"
                value={transaction.transactionHash || 'No Transaction.'}
            />
            <CopiableListElement
                className={styles.listElement}
                title="Block Hash"
                value={transaction.blockHash}
            />
        </Card>
    );
}

export default TransactionView;
