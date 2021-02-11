import React from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { Card, Table, Label, Button } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import { createSimpleTransferTransaction } from '../../utils/transactionHelpers';
import { Account, AddressBookEntry } from '../../utils/types';
import { displayAsGTU } from '../../utils/gtu';

export interface Props {
    account: Account;
    amount: bigint;
    recipient: AddressBookEntry;
}

/**
 * Displays the chosen details of the transaction.
 * And forwards the user to submitting/signing the transaction.
 */
export default function ConfirmTransferComponent({
    account,
    amount,
    recipient,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const estimatedFee = 200n; // TODO calculate

    // This function builds the transaction
    // Then redirects to signing page.
    async function createTransaction() {
        const transferTransaction = await createSimpleTransferTransaction(
            account.address,
            amount,
            recipient.address
        );
        dispatch(
            push({
                pathname: routes.SUBMITTRANSFER,
                state: {
                    transaction: transferTransaction,
                    account,
                    recipient,
                },
            })
        );
    }

    return (
        <Card fluid centered>
            <Card.Content textAlign="center">
                <Card.Header>Confirm Transfer</Card.Header>
                <Table>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>Amount:</Table.Cell>
                            <Table.Cell textAlign="right">
                                {displayAsGTU(amount)}
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Estimated fee:</Table.Cell>
                            <Table.Cell textAlign="right">
                                {displayAsGTU(estimatedFee)}
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
                <Button onClick={createTransaction}>Submit</Button>
            </Card.Content>
        </Card>
    );
}
