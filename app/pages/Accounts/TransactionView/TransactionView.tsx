import React from 'react';
import clsx from 'clsx';
import TransactionListElement from '../TransactionListElement';
import { TransferTransaction, TransactionStatus } from '~/utils/types';
import { isFailed } from '~/utils/transactionHelpers';
import CloseButton from '~/cross-app-components/CloseButton';
import Card from '~/cross-app-components/Card';
import SidedRow from '~/components/SidedRow';
import CopyButton from '~/components/CopyButton';
import { rejectReasonToDisplayText } from '~/utils/node/RejectReasonHelper';
import styles from './TransactionView.module.scss';

interface Props {
    transaction: TransferTransaction;
    returnFunction: () => void;
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
                    <p className="body4">
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
function TransactionView({ transaction, returnFunction }: Props) {
    return (
        <Card className="relative pB10">
            <h3 className={styles.title}> Transaction Details </h3>
            <CloseButton
                className={styles.closeButton}
                onClick={returnFunction}
            />
            <TransactionListElement transaction={transaction} />
            {displayRejectReason(transaction)}
            {!!transaction.fromAddress && (
                <CopiableListElement
                    title="From Address:"
                    value={`${transaction.fromAddress}`}
                    note={transaction.fromAddressName}
                />
            )}
            {transaction.toAddress ? (
                <CopiableListElement
                    title="To Address:"
                    value={`${transaction.toAddress}`}
                    note={transaction.toAddressName}
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
        </Card>
    );
}

export default TransactionView;
