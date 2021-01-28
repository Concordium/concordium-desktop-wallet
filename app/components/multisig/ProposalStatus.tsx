import React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { MultiSignatureTransaction, UpdateType } from '../../utils/types';
import TransactionDetails from '../TransactionDetails';

// TODO This component should also have support for account transactions.

interface Props {
    proposal: MultiSignatureTransaction;
}

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
                <TransactionDetails updateInstruction={updateInstruction} />
            </Grid.Row>
            <Grid.Row>
                <Grid.Column>
                    <Header>Status</Header>
                    {proposal.status.charAt(0).toUpperCase() +
                        proposal.status.slice(1)}
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}
