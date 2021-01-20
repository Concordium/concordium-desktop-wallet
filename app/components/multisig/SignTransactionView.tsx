import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import {
    Button,
    Checkbox,
    Container,
    Divider,
    Form,
    Grid,
    Header,
    Segment,
} from 'semantic-ui-react';
import { hashSha256 } from '../../utils/serializationHelpers';
import LedgerComponent from '../ledger/LedgerComponent';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import TransactionDetails from './TransactionDetails';
import TransactionHashView from './TransactionHashView';
import routes from '../../constants/routes.json';
import { TransactionHandler } from '../../utils/types';
import { UpdateInstructionHandler } from './UpdateInstructionHandler';

const transactionHandlers: TransactionHandler<any>[] = [
    new UpdateInstructionHandler(),
    // TODO Replace with AccountTransactionHandler() when implemented.
    new UpdateInstructionHandler(),
];

export default function SignTransactionView(props) {
    const [cosign, setCosign] = useState(false);
    const [hashMatches, setHashMatches] = useState(false);
    const [pictureMatches, setPictureMatches] = useState(false);
    const [
        transactionDetailsAreCorrect,
        setTransactionDetailsAreCorrect,
    ] = useState(false);
    const dispatch = useDispatch();

    const transaction = props.location.state;
    const transactionHandler = transactionHandlers.find((handler) =>
        handler.instanceOf(transaction)
    );
    if (!transactionHandler) {
        throw new Error(
            'No transaction handler was found. An invalid transaction has been received.'
        );
    }

    const serializedTransaction = transactionHandler.serializeTransaction(
        transaction
    );
    const transactionHash = hashSha256(serializedTransaction).toString('hex');

    async function signingFunction(ledger: ConcordiumLedgerClient) {
        const signatureBytes = await transactionHandler.signTransaction(
            ledger,
            transaction
        );
        const signature = signatureBytes.toString('hex');

        // Load the page for exporting the signed transaction.
        dispatch(
            push({
                pathname: routes.MULTISIGTRANSACTIONS_EXPORT_TRANSACTION,
                state: { transaction, transactionHash, signature },
            })
        );
    }

    // The device component should only be displayed if the user has clicked
    // to co-sign the transaction.
    let ledgerComponent;
    if (cosign) {
        ledgerComponent = <LedgerComponent ledgerCall={signingFunction} />;
    } else {
        ledgerComponent = null;
    }

    return (
        <Container>
            <Segment>
                <Header textAlign="center">
                    Transaction signing confirmation | Transaction Type
                </Header>
                <Divider />
                <Grid columns={2} divided textAlign="center" padded>
                    <Grid.Row>
                        <Grid.Column>
                            <TransactionDetails
                                updateInstruction={transaction}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <TransactionHashView
                                transactionHash={transactionHash}
                            />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Form>
                            <Form.Field>
                                <Checkbox
                                    label="The hash matches the one received exactly"
                                    defaultChecked={hashMatches}
                                    onChange={() =>
                                        setHashMatches(!hashMatches)
                                    }
                                />
                            </Form.Field>
                            <Form.Field>
                                <Checkbox
                                    label="The picture matches the one received exactly"
                                    defaultChecked={pictureMatches}
                                    onChange={() =>
                                        setPictureMatches(!pictureMatches)
                                    }
                                />
                            </Form.Field>
                            <Form.Field>
                                <Checkbox
                                    label="The transaction details are correct"
                                    defaultChecked={
                                        transactionDetailsAreCorrect
                                    }
                                    onChange={() =>
                                        setTransactionDetailsAreCorrect(
                                            !transactionDetailsAreCorrect
                                        )
                                    }
                                />
                            </Form.Field>
                            <Form.Field>
                                <Button
                                    positive
                                    fluid
                                    onClick={() => setCosign(true)}
                                    disabled={
                                        cosign ||
                                        !hashMatches ||
                                        !pictureMatches ||
                                        !transactionDetailsAreCorrect
                                    }
                                >
                                    Co-sign
                                </Button>
                            </Form.Field>
                        </Form>
                    </Grid.Row>
                </Grid>
            </Segment>
            {ledgerComponent}
        </Container>
    );
}
