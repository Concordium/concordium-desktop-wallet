import React from 'react';
import { LocationDescriptorObject } from 'history';
import { Link } from 'react-router-dom';
import { Card, Button, Table, Label } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import { displayAsGTU } from '../../utils/gtu';
import { AddressBookEntry, SimpleTransfer } from '../../utils/types';

interface State {
    transaction: SimpleTransfer;
    recipient: AddressBookEntry;
}

interface Props {
    location: LocationDescriptorObject<State>;
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
                                {displayAsGTU(transaction.payload.amount)}
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Estimated fee:</Table.Cell>
                            <Table.Cell textAlign="right">
                                {displayAsGTU(200n)}
                            </Table.Cell>
                        </Table.Row>
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
