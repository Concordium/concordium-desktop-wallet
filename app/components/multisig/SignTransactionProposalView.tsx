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
import { parse, stringify } from 'json-bigint';
import { hashSha256 } from '../../utils/serializationHelpers';
import LedgerComponent from '../ledger/LedgerComponent';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import TransactionDetails from '../TransactionDetails';
import TransactionHashView from '../TransactionHashView';
import routes from '../../constants/routes.json';
import UpdateInstructionHandler from '../../utils/UpdateInstructionHandler';
import {
    AccountTransaction,
    MultiSignatureTransaction,
    TransactionHandler,
    UpdateInstruction,
} from '../../utils/types';
import { insert } from '../../database/MultiSignatureProposalDao';
import { setCurrentProposal } from '../../features/MultiSignatureSlice';

interface Props {
    location: LocationDescriptorObject<string>;
}

export default function SignTransactionProposalView({ location }: Props) {
    const [sign, setSign] = useState(false);
    const [
        transactionDetailsAreCorrect,
        setTransactionDetailsAreCorrect,
    ] = useState(false);

    const [transactionHash, setTransactionHash] = useState<string>();
    const [transactionHandler, setTransactionHandler] = useState<
        TransactionHandler<UpdateInstruction | AccountTransaction>
    >();

    const dispatch = useDispatch();

    if (!location.state) {
        throw new Error(
            'No transaction handler was found. An invalid transaction has been received.'
        );
    }

    const multiSignatureTransaction: MultiSignatureTransaction = parse(
        location.state
    );
    const { transaction } = multiSignatureTransaction;

    // TODO Add support for account transactions.
    const type = 'UpdateInstruction';
    const updateInstruction: UpdateInstruction = parse(transaction);

    useEffect(() => {
        const transactionObject = parse(transaction);
        // TODO Add AccountTransactionHandler here when implemented.
        const transactionHandlerValue =
            type === 'UpdateInstruction'
                ? new UpdateInstructionHandler(transactionObject)
                : new UpdateInstructionHandler(transactionObject);
        setTransactionHandler(transactionHandlerValue);

        const serialized = transactionHandlerValue.serializeTransaction();
        const hashed = hashSha256(serialized).toString('hex');
        setTransactionHash(hashed);
    }, [setTransactionHandler, setTransactionHash, type, transaction]);

    async function signingFunction(ledger: ConcordiumLedgerClient) {
        const signatureBytes = await transactionHandler.signTransaction(ledger);
        const signature = signatureBytes.toString('hex');

        // Add signature
        updateInstruction.signatures = [signature];

        const updatedMultiSigTransaction = {
            ...multiSignatureTransaction,
            transaction: stringify(updateInstruction),
        };

        // Save to database and use the assigned id to update the local object.
        const entryId = (await insert(updatedMultiSigTransaction))[0];
        updatedMultiSigTransaction.id = entryId;

        // Set the current proposal in the state to the one that was just generated.
        dispatch(setCurrentProposal(updatedMultiSigTransaction));

        // Navigate to the page that displays the current proposal from the state.
        dispatch(push(routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING));
    }

    // The device component should only be displayed if the user has clicked
    // to co-sign the transaction.
    let ledgerComponent;
    if (sign) {
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
                                updateInstruction={updateInstruction}
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
                                    label="The transaction details are correct"
                                    defaultChecked={
                                        transactionDetailsAreCorrect
                                    }
                                    disabled={sign}
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
                                    onClick={() => setSign(true)}
                                    disabled={
                                        sign || !transactionDetailsAreCorrect
                                    }
                                >
                                    Sign
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
