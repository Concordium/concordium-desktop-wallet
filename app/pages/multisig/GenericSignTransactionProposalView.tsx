import React, { useState } from 'react';
import { parse } from 'json-bigint';
import LedgerComponent from '~/components/ledger/LedgerComponent';
import TransactionDetails from '~/components/TransactionDetails';
import TransactionHashView from '~/components/TransactionHashView';
import {
    AccountTransaction,
    instanceOfUpdateInstruction,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '~/utils/types';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import PageLayout from '~/components/PageLayout';
import routes from '~/constants/routes.json';
import ExpiredEffectiveTimeView from './ExpiredEffectiveTimeView';
import Columns from '~/components/Columns';
import Loading from '~/cross-app-components/Loading';
import Form from '~/components/Form';

interface Props<T> {
    header: string;
    transaction: string;
    transactionHash: string;
    signFunction: (input: T) => Promise<void>;
    checkboxes: string[];
    signText: string;
    loading?: boolean;
}

// TODO move to only place this is used.
export default function GenericSignTransactionProposalView({
    header,
    transaction,
    transactionHash,
    signFunction,
    checkboxes,
    signText,
    loading,
}: Props<ConcordiumLedgerClient>) {
    const [signing, setSigning] = useState(false);

    const transactionObject:
        | UpdateInstruction<UpdateInstructionPayload>
        | AccountTransaction = parse(transaction);

    // The device component should only be displayed if the user has clicked
    // to sign the transaction.
    let ledgerComponent;
    if (signing) {
        ledgerComponent = <LedgerComponent ledgerCall={signFunction} />;
    } else {
        ledgerComponent = null;
    }

    let expiredEffectiveTimeComponent;
    if (instanceOfUpdateInstruction(transactionObject)) {
        expiredEffectiveTimeComponent = (
            <ExpiredEffectiveTimeView transaction={transactionObject} />
        );
    }

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>{header}</h1>
            </PageLayout.Header>
            <PageLayout.Container closeRoute={routes.MULTISIGTRANSACTIONS}>
                <h2>Transaction signing confirmation | Transaction Type</h2>
                <div>
                    {loading && <Loading />}
                    <Columns divider>
                        <Columns.Column header="Transaction Details">
                            <TransactionDetails
                                transaction={transactionObject}
                            />
                            {expiredEffectiveTimeComponent}
                        </Columns.Column>
                        <Columns.Column header="Signature and Hardware Wallet">
                            <TransactionHashView
                                transactionHash={transactionHash}
                            />
                            <Form onSubmit={() => setSigning(true)}>
                                {checkboxes.map((label, index) => (
                                    <Form.Checkbox
                                        name={`${index}`}
                                        key={label}
                                        rules={{ required: true }}
                                        disabled={signing}
                                    >
                                        {label}
                                    </Form.Checkbox>
                                ))}
                                <Form.Submit disabled={signing}>
                                    {signText}
                                </Form.Submit>
                            </Form>
                            {ledgerComponent}
                        </Columns.Column>
                    </Columns>
                </div>
            </PageLayout.Container>
        </PageLayout>
    );
}
