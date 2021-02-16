import React from 'react';
import { List, Button, Header, Divider } from 'semantic-ui-react';
import TransactionListElement from './TransactionListElement';
import CopiableListElement from '../../components/CopiableListElement';
import { TransferTransaction, RejectReason } from '../../utils/types';
import { isFailed } from '../../utils/transactionHelpers';

interface Props {
    transaction: TransferTransaction;
    returnFunction: () => void;
}

/**
 * Detailed view of the given transaction.
 */
function TransactionView({ transaction, returnFunction }: Props) {
    return (
        <List>
            <List.Item>
                <Header textAlign="center">Transaction Details</Header>
                <Button onClick={returnFunction}>x</Button>
            </List.Item>
            <List.Item>
                <Divider />
                <TransactionListElement transaction={transaction} />
                <Divider />
            </List.Item>
            {isFailed(transaction) ? (
                <List.Item>
                    <Header color="red" textAlign="center">
                        Failed:{' '}
                        {transaction.rejectReason
                            ? RejectReason[transaction.rejectReason]
                            : null}
                    </Header>
                    <Divider />
                </List.Item>
            ) : null}
            <CopiableListElement
                title="From Address:"
                value={transaction.fromAddress}
                note={transaction.fromAddressName}
            />
            <Divider />
            <CopiableListElement
                title="To Address:"
                value={transaction.toAddress}
                note={transaction.toAddressName}
            />
            <Divider />
            <CopiableListElement
                title="Transaction Hash"
                value={transaction.transactionHash || 'No Transaction.'}
            />
            <Divider />
            <CopiableListElement
                title="Block Hash"
                value={transaction.blockHash}
            />
        </List>
    );
}

export default TransactionView;
