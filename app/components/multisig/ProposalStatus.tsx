import React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import {
    ColorType,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateType,
} from '../../utils/types';
import TransactionDetails from '../TransactionDetails';
import StatusLabel from './StatusLabel';

// TODO This component should also have support for account transactions.

interface Props {
    proposal: MultiSignatureTransaction;
}

const statusColorMap = new Map<MultiSignatureTransactionStatus, ColorType>([
    [MultiSignatureTransactionStatus.Open, ColorType.Blue],
    [MultiSignatureTransactionStatus.Submitted, ColorType.Olive],
    [MultiSignatureTransactionStatus.Finalized, ColorType.Green],
    [MultiSignatureTransactionStatus.Failed, ColorType.Red],
]);

/**
 * Component that displays a status overview of a multi signature proposal.
 */
export default function ProposalStatus({ proposal }: Props) {
    const updateInstruction = JSON.parse(proposal.transaction);

    return (
        <Grid padded>
            <Grid.Row columns="equal">
                <Grid.Column>
                    <Header>{UpdateType[updateInstruction.type]}</Header>
                </Grid.Column>
                <Grid.Column textAlign="right">
                    <Header>Foundation transaction</Header>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row centered>
                <TransactionDetails transaction={updateInstruction} />
            </Grid.Row>
            <Grid.Row>
                <Grid.Column>
                    <StatusLabel
                        status={proposal.status}
                        color={statusColorMap.get(proposal.status)}
                    />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}
