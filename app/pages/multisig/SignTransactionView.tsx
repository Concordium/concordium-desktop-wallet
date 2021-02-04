import React, { useEffect, useState } from 'react';
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
import { LocationDescriptorObject } from 'history';
import { parse } from 'json-bigint';
import { hashSha256 } from '../../utils/serializationHelpers';
import LedgerComponent from '../../components/ledger/LedgerComponent';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import TransactionDetails from '../../components/TransactionDetails';
import TransactionHashView from '../../components/TransactionHashView';
import routes from '../../constants/routes.json';
import UpdateInstructionHandler from '../../utils/UpdateInstructionHandler';
import {
    AccountTransaction,
    TransactionHandler,
    UpdateInstruction,
} from '../../utils/types';

interface Props {
    location: LocationDescriptorObject<TransactionInput>;
}

interface TransactionInput {
    transaction: string;
    type: string;
}

function createTransactionHandler(state: TransactionInput | undefined) {
    if (!state) {
        throw new Error(
            'No transaction handler was found. An invalid transaction has been received.'
        );
    }
    const { transaction, type } = state;

    const transactionObject = parse(transaction);
    // TODO Add AccountTransactionHandler here when implemented.
    const transactionHandlerValue =
        type === 'UpdateInstruction'
            ? new UpdateInstructionHandler(transactionObject)
            : new UpdateInstructionHandler(transactionObject);
    return transactionHandlerValue;
}

export default function SignTransactionView({ location }: Props) {
    const [cosign, setCosign] = useState(false);
    const [hashMatches, setHashMatches] = useState(false);
    const [pictureMatches, setPictureMatches] = useState(false);
    const [
        transactionDetailsAreCorrect,
        setTransactionDetailsAreCorrect,
    ] = useState(false);

    const [transactionHash, setTransactionHash] = useState<string>();
    const [transactionHandler] = useState<
        TransactionHandler<
            UpdateInstruction | AccountTransaction,
            ConcordiumLedgerClient
        >
    >(() => createTransactionHandler(location.state));

    const dispatch = useDispatch();

    if (!location.state) {
        throw new Error(
            'No transaction handler was found. An invalid transaction has been received.'
        );
    }

    const { transaction } = location.state;

    useEffect(() => {
        const serialized = transactionHandler.serializeTransaction();
        const hashed = hashSha256(serialized).toString('hex');
        setTransactionHash(hashed);
    }, [setTransactionHash, transactionHandler]);

    async function signingFunction(ledger: ConcordiumLedgerClient) {
        const signatureBytes = await transactionHandler.signTransaction(ledger);
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
                                updateInstruction={parse(transaction)}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <TransactionHashView
                                transactionHash={transactionHash || ''}
                            />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Form>
                            <Form.Field>
                                <Checkbox
                                    label="The hash matches the one received exactly"
                                    defaultChecked={hashMatches}
                                    disabled={cosign}
                                    onChange={() =>
                                        setHashMatches(!hashMatches)
                                    }
                                />
                            </Form.Field>
                            <Form.Field>
                                <Checkbox
                                    label="The picture matches the one received exactly"
                                    defaultChecked={pictureMatches}
                                    disabled={cosign}
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
                                    disabled={cosign}
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
