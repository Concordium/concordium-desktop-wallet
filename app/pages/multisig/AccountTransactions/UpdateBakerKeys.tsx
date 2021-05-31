import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useRouteMatch } from 'react-router';
import { push } from 'connected-react-router';
import MultiSignatureLayout from '../MultiSignatureLayout/MultiSignatureLayout';
import Columns from '~/components/Columns';
import Button from '~/cross-app-components/Button';
import {
    Identity,
    Account,
    TransactionKindId,
    UpdateBakerKeysPayload,
    UpdateBakerKeys,
} from '~/utils/types';
import PickIdentity from '~/components/PickIdentity';
import PickAccount from './PickAccount';
import styles from './MultisignatureAccountTransactions.module.scss';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import { BakerKeys, generateBakerKeys } from '~/utils/rustInterface';
import {
    createMultisignatureTransaction,
    signUsingLedger,
} from './SignTransaction';
import SignTransactionColumn from '../SignTransactionProposal/SignTransaction';

import { createUpdateBakerKeysTransaction } from '~/utils/transactionHelpers';
import { selectedProposalRoute } from '~/utils/routerHelper';
import routes from '~/constants/routes.json';
import {
    useTransactionCostEstimate,
    useTransactionExpiryState,
} from '~/utils/hooks';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { addProposal } from '~/features/MultiSignatureSlice';
import { DownloadBakerCredentialsStep } from './AddBaker';
import UpdateBakerKeysProposalDetails from './proposal-details/UpdateBakerKeysProposalDetails';
import InputTimestamp from '~/components/Form/InputTimestamp';

const pageTitle = 'Multi Signature Transactions | Update Baker Keys';

enum BuildSubRoutes {
    accounts = 'accounts',
    keys = 'keys',
    sign = 'sign',
    expiry = 'expiry',
}

export default function UpdateBakerKeysPage() {
    const dispatch = useDispatch();
    const { path, url } = useRouteMatch();
    const [identity, setIdentity] = useState<Identity>();
    const [account, setAccount] = useState<Account>();
    const [error, setError] = useState<string>();
    const [bakerKeys, setBakerKeys] = useState<BakerKeys>();
    const [transaction, setTransaction] = useState<UpdateBakerKeys>();

    const estimatedFee = useTransactionCostEstimate(
        TransactionKindId.Remove_baker,
        account?.signatureThreshold
    );

    const [
        expiryTime,
        setExpiryTime,
        expiryTimeError,
    ] = useTransactionExpiryState();

    const onGenerateKeys = () => {
        if (account === undefined) {
            setError('An account is needed to generate baker keys');
            return;
        }
        generateBakerKeys(account.address, 'UPDATE')
            .then((keys) => setBakerKeys(keys))
            .catch(() => setError('Failed generating baker keys'));
    };

    const onCreateTransaction = () => {
        if (bakerKeys === undefined) {
            setError('Baker keys are needed to make transaction');
            return;
        }
        if (account === undefined) {
            setError('Account is needed to make transaction');
            return;
        }

        const payload: UpdateBakerKeysPayload = {
            electionVerifyKey: bakerKeys.electionPublic,
            signatureVerifyKey: bakerKeys.signaturePublic,
            aggregationVerifyKey: bakerKeys.aggregationPublic,
            proofElection: bakerKeys.proofElection,
            proofSignature: bakerKeys.proofSignature,
            proofAggregation: bakerKeys.proofAggregation,
        };
        createUpdateBakerKeysTransaction(account.address, payload)
            .then(setTransaction)
            .catch((e: Error) =>
                setError(`Failed create transaction: ${e.message}`)
            );
    };

    const signingFunction = async (ledger?: ConcordiumLedgerClient) => {
        if (!account) {
            throw new Error('unexpected missing account');
        }
        if (transaction === undefined) {
            throw new Error('unexpected missing transaction');
        }
        if (bakerKeys === undefined) {
            throw new Error('unexpected missing bakerKeys');
        }

        let signatures = {};
        if (ledger) {
            signatures = await signUsingLedger(ledger, transaction, account);
        }
        const proposal = await createMultisignatureTransaction(
            transaction,
            signatures,
            account.signatureThreshold
        );
        if (proposal.id === undefined) {
            throw new Error('unexpected undefined proposal id');
        }

        // Set the current proposal in the state to the one that was just generated.
        dispatch(addProposal(proposal));
        dispatch(push(selectedProposalRoute(proposal.id)));
    };

    return (
        <MultiSignatureLayout
            pageTitle={pageTitle}
            stepTitle="Transaction Proposal - Update Baker Keys"
        >
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to perform transfer"
                content={error}
                onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
            />
            <Columns divider columnScroll>
                <Columns.Column header="Transaction Details" verticalPadding>
                    <UpdateBakerKeysProposalDetails
                        identity={identity}
                        account={account}
                        estimatedFee={estimatedFee}
                        bakerVerifyKeys={
                            bakerKeys === undefined
                                ? undefined
                                : {
                                      electionVerifyKey:
                                          bakerKeys.electionPublic,
                                      signatureVerifyKey:
                                          bakerKeys.signaturePublic,
                                      aggregationVerifyKey:
                                          bakerKeys.aggregationPublic,
                                  }
                        }
                        expiryTime={expiryTime}
                    />
                </Columns.Column>
                <Switch>
                    <Route exact path={path}>
                        <Columns.Column header="Identities">
                            <div className={styles.descriptionStep}>
                                <div className={styles.flex1}>
                                    <PickIdentity
                                        setIdentity={setIdentity}
                                        chosenIdentity={identity}
                                    />
                                </div>
                                <Button
                                    disabled={identity === undefined}
                                    onClick={() =>
                                        dispatch(
                                            push(
                                                `${url}/${BuildSubRoutes.accounts}`
                                            )
                                        )
                                    }
                                >
                                    Continue
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${BuildSubRoutes.accounts}`}>
                        <Columns.Column header="Accounts">
                            <div className={styles.descriptionStep}>
                                <div className={styles.flex1}>
                                    <PickAccount
                                        identity={identity}
                                        setAccount={setAccount}
                                        chosenAccount={account}
                                        filter={(_, info) =>
                                            info?.accountBaker !== undefined
                                        }
                                    />
                                </div>
                                <Button
                                    disabled={account === undefined}
                                    onClick={() => {
                                        dispatch(
                                            push(
                                                `${url}/${BuildSubRoutes.expiry}`
                                            )
                                        );
                                    }}
                                >
                                    Continue
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${BuildSubRoutes.expiry}`}>
                        <Columns.Column header="Transaction expiry time">
                            <div className={styles.descriptionStep}>
                                <div className={styles.flex1}>
                                    <p>
                                        Choose the expiry date for the
                                        transaction.
                                    </p>
                                    <InputTimestamp
                                        label="Transaction expiry time"
                                        name="expiry"
                                        isInvalid={
                                            expiryTimeError !== undefined
                                        }
                                        error={expiryTimeError}
                                        value={expiryTime}
                                        onChange={setExpiryTime}
                                    />
                                    <p>
                                        Committing the transaction after this
                                        date, will be rejected.
                                    </p>
                                </div>
                                <Button
                                    disabled={
                                        expiryTime === undefined ||
                                        expiryTimeError !== undefined
                                    }
                                    onClick={() => {
                                        onGenerateKeys();
                                        dispatch(
                                            push(
                                                `${url}/${BuildSubRoutes.keys}`
                                            )
                                        );
                                    }}
                                >
                                    Generate keys
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${BuildSubRoutes.keys}`}>
                        <Columns.Column header="Baker keys">
                            {bakerKeys !== undefined &&
                            account !== undefined ? (
                                <DownloadBakerCredentialsStep
                                    accountAddress={account.address}
                                    bakerKeys={bakerKeys}
                                    onContinue={() => {
                                        onCreateTransaction();
                                        dispatch(
                                            push(
                                                `${url}/${BuildSubRoutes.sign}`
                                            )
                                        );
                                    }}
                                />
                            ) : (
                                <p>Generating keys...</p>
                            )}
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${BuildSubRoutes.sign}`}>
                        <Columns.Column header="Signature and Hardware Wallet">
                            <SignTransactionColumn
                                signingFunction={signingFunction}
                                onSkip={() => signingFunction()}
                            />
                        </Columns.Column>
                    </Route>
                </Switch>
            </Columns>
        </MultiSignatureLayout>
    );
}
