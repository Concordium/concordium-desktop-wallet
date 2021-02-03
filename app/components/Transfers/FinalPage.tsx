import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Table, Label } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import { displayAsGTU } from '../../utils/gtu';
import { AccountTransaction, AddressBookEntry } from '../../utils/types';

interface Props {
    transaction: AccountTransaction;
    recipient: AddressBookEntry;
}

/**
 * Displays details of a completed transaction.
 * TODO: fix estimatedFee
 * TODO: generalize (right now expects simple transfer)
 */
export default function FinalPage({
    transaction,
    recipient,
}: Props): JSX.Element {
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
