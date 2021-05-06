import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router';
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
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import { BakerKeys, generateBakerKeys } from '~/utils/rustInterface';
import { signUsingLedger } from './SignTransaction';
import SignTransactionColumn from '../SignTransactionProposal/SignTransaction';

import { createUpdateBakerKeysTransaction } from '~/utils/transactionHelpers';
import { selectedProposalRoute } from '~/utils/routerHelper';
import routes from '~/constants/routes.json';
import { useTransactionCostEstimate } from '~/utils/hooks';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { addProposal } from '~/features/MultiSignatureSlice';
import { DownloadBakerCredentialsStep } from './AddBaker';
import PublicKey from '../common/PublicKey/PublicKey';

const pageTitle = 'Multi Signature Transactions | Update Baker Keys';

enum SubRoutes {
    proposal = 'proposal',
    downloadKeys = 'download-keys',
}

export default function AddBakerPage() {
    const { path, url } = useRouteMatch();
    const dispatch = useDispatch();
    const [proposalId, setProposalId] = useState<number>();
    const [bakerKeys, setBakerKeys] = useState<BakerKeys>();
    const [senderAddress, setSenderAddress] = useState<string>();

    return (
        <Switch>
            <Route path={path} exact>
                <Redirect to={`${url}/${SubRoutes.proposal}`} />
            </Route>
            <Route path={`${path}/${SubRoutes.proposal}`}>
                <BuildAddBakerTransactionProposalStep
                    onNewProposal={(id, keys, address) => {
                        setProposalId(id);
                        setBakerKeys(keys);
                        setSenderAddress(address);
                        dispatch(push(`${url}/${SubRoutes.downloadKeys}`));
                    }}
                />
            </Route>
            <Route path={`${path}/${SubRoutes.downloadKeys}`}>
                {bakerKeys !== undefined &&
                proposalId !== undefined &&
                senderAddress !== undefined ? (
                    <DownloadBakerCredentialsStep
                        bakerKeys={bakerKeys}
                        pageTitle={pageTitle}
                        accountAddress={senderAddress}
                        onContinue={() => {
                            dispatch(push(selectedProposalRoute(proposalId)));
                        }}
                    />
                ) : null}
            </Route>
        </Switch>
    );
}

const placeholderText = 'To be determined';

type BuildTransactionProposalStepProps = {
    onNewProposal: (
        proposalId: number,
        keys: BakerKeys,
        accountAddress: string
    ) => void;
};

enum BuildSubRoutes {
    accounts = 'accounts',
    keys = 'keys',
    sign = 'sign',
}

function BuildAddBakerTransactionProposalStep({
    onNewProposal,
}: BuildTransactionProposalStepProps) {
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

    const signingFunction = async (ledger: ConcordiumLedgerClient) => {
        if (!account) {
            throw new Error('unexpected missing account');
        }
        if (transaction === undefined) {
            throw new Error('unexpected missing transaction');
        }
        if (bakerKeys === undefined) {
            throw new Error('unexpected missing bakerKeys');
        }

        const proposal = await signUsingLedger(ledger, transaction, account);
        if (proposal.id === undefined) {
            throw new Error('unexpected undefined proposal id');
        }

        // Set the current proposal in the state to the one that was just generated.
        dispatch(addProposal(proposal));
        onNewProposal(proposal.id, bakerKeys, account.address);
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
                <Columns.Column header="Transaction Details">
                    <div className={styles.details}>
                        <b>Identity:</b>
                        <h2>{identity ? identity.name : placeholderText}</h2>
                        <b>Account:</b>
                        <h2>{account ? account.name : placeholderText}</h2>
                        <DisplayEstimatedFee estimatedFee={estimatedFee} />
                        <b>Public keys</b>
                        {bakerKeys === undefined ? (
                            'To be generated'
                        ) : (
                            <>
                                <PublicKey
                                    name="Election verify key"
                                    publicKey={bakerKeys.electionPublic}
                                />
                                <PublicKey
                                    name="Signature verify key"
                                    publicKey={bakerKeys.signaturePublic}
                                />
                                <PublicKey
                                    name="Aggregation verify key"
                                    publicKey={bakerKeys.aggregationPublic}
                                />
                            </>
                        )}
                    </div>
                </Columns.Column>
                <Switch>
                    <Route exact path={path}>
                        <Columns.Column header="Identities">
                            <div className={styles.descriptionStep}>
                                <div
                                    className={`${styles.flex1} ${styles.alignSelfNormal}`}
                                >
                                    <PickIdentity
                                        setReady={() => {}}
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
                                        setReady={() => {}}
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
                            <div className={styles.descriptionStep}>
                                <div className={styles.flex1}>
                                    {bakerKeys === undefined ? (
                                        <p>Generating keys...</p>
                                    ) : (
                                        <p>
                                            Your baker keys have been generated,
                                            and the public keys can be seen to
                                            the left.
                                        </p>
                                    )}
                                </div>
                                <Button
                                    disabled={bakerKeys === undefined}
                                    onClick={() => {
                                        onCreateTransaction();
                                        dispatch(
                                            push(
                                                `${url}/${BuildSubRoutes.sign}`
                                            )
                                        );
                                    }}
                                >
                                    Continue
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${BuildSubRoutes.sign}`}>
                        <Columns.Column header="Signature and Hardware Wallet">
                            <SignTransactionColumn
                                signingFunction={signingFunction}
                            />
                        </Columns.Column>
                    </Route>
                </Switch>
            </Columns>
        </MultiSignatureLayout>
    );
}
