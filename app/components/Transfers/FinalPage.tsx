import React from 'react';
import { LocationDescriptorObject } from 'history';
import { Link } from 'react-router-dom';
import { Card, Button, Table, Label } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import { displayAsGTU } from '../../utils/gtu';
import { parseTime } from '../../utils/timeHelpers';
import { getScheduledTransferAmount } from '../../utils/transactionHelpers';

import {
    AddressBookEntry,
    AccountTransaction,
    instanceOfScheduledTransfer,
    instanceOfSimpleTransfer,
    TransactionPayload,
    TimeStampUnit,
} from '../../utils/types';

interface State {
    transaction: AccountTransaction;
    recipient: AddressBookEntry;
}

interface Props {
    location: LocationDescriptorObject<State>;
}

function getAmount(transaction: AccountTransaction) {
    if (instanceOfScheduledTransfer(transaction)) {
        return getScheduledTransferAmount(transaction);
    }
    if (instanceOfSimpleTransfer(transaction)) {
        return transaction.payload.amount;
    }
    throw new Error('Unsupported transaction type - please implement');
}

function displayNote(transaction: AccountTransaction<TransactionPayload>) {
    if (instanceOfScheduledTransfer(transaction)) {
        return (
            <Table.Row>
                <Table.Cell textAlign="center">
                    Split into {transaction.payload.schedule.length} releases,
                    starting:
                    {parseTime(
                        transaction.payload.schedule[0].timestamp,
                        TimeStampUnit.milliSeconds
                    )}
                </Table.Cell>
            </Table.Row>
        );
    }
    return null;
}

/**
 * Displays details of a completed transaction.
 * TODO: fix estimatedFee
 * TODO: generalize (right now expects simple transfer)
 */
export default function FinalPage({ location }: Props): JSX.Element {
    if (!location.state) {
        throw new Error('Unexpected missing state.');
    }

    const { transaction, recipient } = location.state;

    return (
        <Card fluid centered>
            <Card.Content textAlign="center">
                <Card.Header>Transfer Submitted!</Card.Header>
                <Table>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>Amount:</Table.Cell>
                            <Table.Cell textAlign="right">
                                {displayAsGTU(getAmount(transaction))}
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Estimated fee:</Table.Cell>
                            <Table.Cell textAlign="right">
                                {displayAsGTU(200n)}
                            </Table.Cell>
                        </Table.Row>
                        {displayNote(transaction)}
                        <Table.Row>
                            <Table.Cell>To:</Table.Cell>
                            <Table.Cell textAlign="right">
                                {recipient.name}{' '}
                                <Label>{recipient.address}</Label>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
                <Link to={routes.ACCOUNTS}>
                    <Button>Finish</Button>
                </Link>
            </Card.Content>
        </Card>
    );
}
