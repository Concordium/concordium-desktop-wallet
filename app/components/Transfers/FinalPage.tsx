import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Table, Label } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import { fromMicroUnits } from '../../utils/transactionHelpers';
import { AccountTransaction, AddressBookEntry } from '../../utils/types';

interface Props {
    transaction: AccountTransaction;
    recipient: AddressBookEntry;
}

// TODO: fix estimatedFee
export default function FinalPage({
    transaction,
    recipient,
}: Props): JSX.Element {
    return (
        <Card fluid centered>
            <Card.Content textAlign="center">
                <Card.Header>Transfer Submitted!</Card.Header>
                <Table>
                    <Table.Row>
                        <Table.Cell>Amount:</Table.Cell>
                        <Table.Cell textAlign="right">
                            {' '}
                            {'\u01E4'}{' '}
                            {fromMicroUnits(transaction.payload.amount)}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Estimated fee:</Table.Cell>
                        <Table.Cell textAlign="right">
                            {' '}
                            {'\u01E4'} {fromMicroUnits(1)}{' '}
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>To:</Table.Cell>
                        <Table.Cell textAlign="right">
                            {recipient.name} <Label>{recipient.address}</Label>
                        </Table.Cell>
                    </Table.Row>
                </Table>
                <Link to={routes.ACCOUNTS}>
                    <Button>Finish</Button>
                </Link>
            </Card.Content>
        </Card>
    );
}
