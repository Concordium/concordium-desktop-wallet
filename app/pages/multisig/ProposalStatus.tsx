import React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { parse } from 'json-bigint';
import {
    ColorType,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateType,
    Transaction,
    instanceOfUpdateInstruction,
    TransactionKindId,
} from '../../utils/types';
import TransactionDetails from '../../components/TransactionDetails';
import StatusLabel from './StatusLabel';
import ExpiredEffectiveTimeView from './ExpiredEffectiveTimeView';

// TODO This component should also have support for account transactions.

interface Props {
    proposal: MultiSignatureTransaction;
}

function getHeader(transaction: Transaction) {
    if (instanceOfUpdateInstruction(transaction)) {
        return UpdateType[transaction.type];
    }
    return TransactionKindId[transaction.transactionKind];
}

function getType(transaction: Transaction) {
    if (instanceOfUpdateInstruction(transaction)) {
        return 'Foundation transaction';
    }
    return 'Account transaction';
}

const statusColorMap = new Map<MultiSignatureTransactionStatus, ColorType>([
    [MultiSignatureTransactionStatus.Open, ColorType.Blue],
    [MultiSignatureTransactionStatus.Submitted, ColorType.Olive],
    [MultiSignatureTransactionStatus.Finalized, ColorType.Green],
    [MultiSignatureTransactionStatus.Failed, ColorType.Red],
    [MultiSignatureTransactionStatus.Expired, ColorType.Red],
]);

/**
 * Component that displays a status overview of a multi signature proposal.
 */
export default function ProposalStatus({ proposal }: Props) {
    const transaction = parse(proposal.transaction);

    return (
        <Grid padded>
            <Grid.Row columns="equal">
                <Grid.Column>
                    <Header>{getHeader(transaction)}</Header>
                </Grid.Column>
                <Grid.Column textAlign="right">
                    <Header>{getType(transaction)}</Header>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row columns="equal" textAlign="center">
                <Grid.Column />
                <Grid.Column>
                    <TransactionDetails transaction={transaction} />
                    <ExpiredEffectiveTimeView
                        transaction={transaction}
                        proposal={proposal}
                    />
                </Grid.Column>
                <Grid.Column />
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
