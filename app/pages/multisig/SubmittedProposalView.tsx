import { push } from 'connected-react-router';
import { LocationDescriptorObject } from 'history';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Button, Divider, Grid, Header, Segment } from 'semantic-ui-react';
import { parse } from 'json-bigint';
import { hashSha256 } from '../../utils/serializationHelpers';
import {
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../../utils/types';
import TransactionDetails from '../../components/TransactionDetails';
import TransactionHashView from '../../components/TransactionHashView';
import routes from '../../constants/routes.json';
import { findUpdateInstructionHandler } from '../../utils/updates/HandlerFinder';
import { serializeUpdateInstructionHeaderAndPayload } from '../../utils/UpdateSerialization';
import PageLayout from '../../components/PageLayout';

interface Props {
    location: LocationDescriptorObject<string>;
}

/**
 * Parses the state (which is received as a JSON serialized string) to a multi signature transaction.
 */
function parseMultiSignatureTransactionFromState(
    location: LocationDescriptorObject<string>
) {
    if (!location.state) {
        throw new Error('A state has to be provided to this component.');
    }

    const multiSignatureTransaction: MultiSignatureTransaction = JSON.parse(
        location.state
    );
    if (!multiSignatureTransaction) {
        throw new Error(
            'A serialized multi signature transaction has to be provided to this component.'
        );
    }

    return multiSignatureTransaction;
}

/**
 * Component that displays a multi signature transaction that has been submitted
 * to a node.
 */
export default function SubmittedProposalView({ location }: Props) {
    const dispatch = useDispatch();

    const multiSignatureTransaction = parseMultiSignatureTransactionFromState(
        location
    );

    // TODO Support account transactions.
    const updateInstruction: UpdateInstruction<UpdateInstructionPayload> = parse(
        multiSignatureTransaction.transaction
    );
    const handler = findUpdateInstructionHandler(updateInstruction.type);
    const transactionHash = hashSha256(
        serializeUpdateInstructionHeaderAndPayload(
            updateInstruction,
            handler.serializePayload(updateInstruction)
        )
    ).toString('hex');

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>{handler.title}</h1>
            </PageLayout.Header>
            <Segment secondary textAlign="center">
                <Header size="large">
                    Your transaction has been submitted
                </Header>
                <Segment>
                    <Header>Transaction Proposal | Transaction Type</Header>
                    <Divider />
                    <Grid columns={2} divided textAlign="center" padded>
                        <Grid.Column>
                            <TransactionDetails
                                transaction={updateInstruction}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <TransactionHashView
                                transactionHash={transactionHash}
                            />
                        </Grid.Column>
                    </Grid>
                </Segment>
                <Button
                    fluid
                    primary
                    onClick={() => {
                        dispatch(
                            push({ pathname: routes.MULTISIGTRANSACTIONS })
                        );
                    }}
                >
                    Okay, thanks!
                </Button>
            </Segment>
        </PageLayout>
    );
}
