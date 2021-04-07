import React, { useEffect, useState } from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { parse } from '~/utils/JSONHelper';
import {
    ColorType,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateType,
    Transaction,
    instanceOfUpdateInstruction,
} from '~/utils/types';
import TransactionDetails from '~/components/TransactionDetails';
import StatusLabel from './StatusLabel';
import ExpiredEffectiveTimeView from './ExpiredEffectiveTimeView';
import { lookupName } from '~/utils/transactionHelpers';

interface Props {
    proposal: MultiSignatureTransaction;
}

async function getHeader(transaction: Transaction) {
    if (instanceOfUpdateInstruction(transaction)) {
        return UpdateType[transaction.type];
    }
    const name = await lookupName(transaction.sender);
    return name || transaction.sender;
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
    const [header, setHeader] = useState('');

    useEffect(() => {
        getHeader(transaction)
            .then((h) => setHeader(h))
            .catch(() => {
                throw new Error('unexpectedly failed to get Header');
            });
    }, [transaction, setHeader]);

    return (
        <Grid padded>
            <Grid.Row columns="equal">
                <Grid.Column>
                    <Header>{header}</Header>
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
