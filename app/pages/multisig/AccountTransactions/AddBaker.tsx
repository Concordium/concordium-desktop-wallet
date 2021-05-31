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
    AccountTransaction,
    AddBakerPayload,
} from '~/utils/types';
import PickIdentity from '~/components/PickIdentity';
import PickAccount from './PickAccount';
import { toMicroUnits } from '~/utils/gtu';
import PickAmount from './PickAmount';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import { BakerKeys, generateBakerKeys } from '~/utils/rustInterface';
import SignTransactionColumn from '../SignTransactionProposal/SignTransaction';
import errorMessages from '~/constants/errorMessages.json';

import {
    createAddBakerTransaction,
    validateBakerStake,
} from '~/utils/transactionHelpers';
import { selectedProposalRoute } from '~/utils/routerHelper';
import routes from '~/constants/routes.json';
import { saveFile } from '~/utils/FileHelper';
import {
    useAccountInfo,
    useChainParameters,
    useTransactionCostEstimate,
    useTransactionExpiryState,
} from '~/utils/dataHooks';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import {
    signUsingLedger,
    createMultisignatureTransaction,
} from './SignTransaction';
import { addProposal } from '~/features/MultiSignatureSlice';
import ButtonGroup from '~/components/ButtonGroup';
import AddBakerProposalDetails from './proposal-details/AddBakerProposalDetails';
import InputTimestamp from '~/components/Form/InputTimestamp';

import styles from './MultisignatureAccountTransactions.module.scss';

const pageTitle = 'Multi Signature Transactions | Add Baker';

enum BuildSubRoutes {
    accounts = 'accounts',
    stake = 'stake',
    keys = 'keys',
    expiry = 'expiry',
    sign = 'sign',
}

export default function AddBakerPage() {
    const dispatch = useDispatch();
    const { path, url } = useRouteMatch();
    const [identity, setIdentity] = useState<Identity>();
    const [account, setAccount] = useState<Account>();
    const [stake, setStake] = useState<string>();
    const [restakeEnabled, setRestakeEnabled] = useState(true);
    const [error, setError] = useState<string>();
    const [bakerKeys, setBakerKeys] = useState<BakerKeys>();
    const [transaction, setTransaction] = useState<
        AccountTransaction<AddBakerPayload>
    >();
    const chainParameters = useChainParameters();
    const minimumThresholdForBaking =
        chainParameters === undefined
            ? undefined
            : BigInt(chainParameters.minimumThresholdForBaking);
    const [
        expiryTime,
        setExpiryTime,
        expiryTimeError,
    ] = useTransactionExpiryState();

    const estimatedFee = useTransactionCostEstimate(
        TransactionKindId.Add_baker,
        account?.signatureThreshold
    );

    const onGenerateKeys = () => {
        if (account === undefined) {
            setError('An account is needed to generate baker keys');
            return;
        }
        generateBakerKeys(account.address, 'ADD')
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
        if (expiryTime === undefined) {
            setError('Expiry time is needed to make transaction');
            return;
        }
        if (stake === undefined) {
            setError('Baker stake is needed to make transaction');
            return;
        }

        const payload: AddBakerPayload = {
            electionVerifyKey: bakerKeys.electionPublic,
            signatureVerifyKey: bakerKeys.signaturePublic,
            aggregationVerifyKey: bakerKeys.aggregationPublic,
            proofElection: bakerKeys.proofElection,
            proofSignature: bakerKeys.proofSignature,
            proofAggregation: bakerKeys.proofAggregation,
            bakingStake: toMicroUnits(stake),
            restakeEarnings: restakeEnabled,
        };
        createAddBakerTransaction(
            account.address,
            payload,
            account.signatureThreshold,
            expiryTime
        )
            .then(setTransaction)
            .catch(() => setError('Failed create transaction'));
    };

    /** Creates the transaction, and if the ledger parameter is provided, also
     *  adds a signature on the transaction.
     */
    const signingFunction = async (ledger?: ConcordiumLedgerClient) => {
        if (!global) {
            throw new Error(errorMessages.missingGlobal);
        }
        if (!account) {
            throw new Error('Unexpected missing account');
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
            stepTitle="Transaction Proposal - Add Baker"
            delegateScroll
        >
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to perform transfer"
                content={error}
                onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
            />
            <Columns
                divider
                columnScroll
                className={styles.subtractContainerPadding}
                columnClassName={styles.column}
            >
                <Columns.Column header="Transaction Details">
                    <div className={styles.columnContent}>
                        <AddBakerProposalDetails
                            identity={identity}
                            account={account}
                            stake={stake}
                            estimatedFee={estimatedFee}
                            restakeEarnings={restakeEnabled}
                            expiryTime={expiryTime}
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
                        />
                    </div>
                </Columns.Column>
                <Switch>
                    <Route exact path={path}>
                        <Columns.Column
                            header="Identities"
                            className={styles.stretchColumn}
                        >
                            <div className={styles.columnContent}>
                                <div className={styles.flex1}>
                                    <PickIdentity
                                        setIdentity={setIdentity}
                                        chosenIdentity={identity}
                                    />
                                </div>
                                <Button
                                    className={styles.listSelectButton}
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
                        <Columns.Column
                            header="Accounts"
                            className={styles.stretchColumn}
                        >
                            <div className={styles.columnContent}>
                                <div className={styles.flex1}>
                                    <PickAccount
                                        identity={identity}
                                        setAccount={setAccount}
                                        chosenAccount={account}
                                        filter={(_, info) =>
                                            info?.accountBaker === undefined
                                        }
                                    />
                                </div>
                                <Button
                                    className={styles.listSelectButton}
                                    disabled={account === undefined}
                                    onClick={() =>
                                        dispatch(
                                            push(
                                                `${url}/${BuildSubRoutes.stake}`
                                            )
                                        )
                                    }
                                >
                                    Continue
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>

                    <Route path={`${path}/${BuildSubRoutes.stake}`}>
                        <Columns.Column
                            header="Stake"
                            className={styles.stretchColumn}
                        >
                            <div className={styles.columnContent}>
                                <div className={styles.flex1}>
                                    <p className="mT0">
                                        To add a baker you must choose an amount
                                        to stake on the account. The staked
                                        amount will be part of the balance, but
                                        while staked the amount is unavailable
                                        for transactions.{' '}
                                    </p>
                                    <PickAmount
                                        amount={stake}
                                        account={account}
                                        estimatedFee={estimatedFee}
                                        validateAmount={(...args) =>
                                            validateBakerStake(
                                                minimumThresholdForBaking,
                                                ...args
                                            )
                                        }
                                        setAmount={(gtuString) =>
                                            setStake(gtuString)
                                        }
                                    />
                                    <p>
                                        By default all baker rewards are added
                                        to the staked amount. This can be
                                        disabled below.
                                    </p>
                                    <ButtonGroup
                                        title="Enable restake earnings"
                                        name="restake"
                                        buttons={[
                                            {
                                                label: 'Yes, restake',
                                                value: true,
                                            },
                                            {
                                                label: 'No, don’t restake',
                                                value: false,
                                            },
                                        ]}
                                        isSelected={({ value }) =>
                                            value === restakeEnabled
                                        }
                                        onClick={({ value }) =>
                                            setRestakeEnabled(value)
                                        }
                                    />
                                </div>
                                <Button
                                    className="mT40"
                                    disabled={stake === undefined}
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
                        <Columns.Column
                            header="Transaction expiry time"
                            className={styles.stretchColumn}
                        >
                            <div className={styles.columnContent}>
                                <div className={styles.flex1}>
                                    <p className="mT0">
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
                                    <p className="mB0">
                                        Committing the transaction after this
                                        date, will be rejected.
                                    </p>
                                </div>
                                <Button
                                    className="mT40"
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
                        <Columns.Column
                            header="Baker keys"
                            className={styles.stretchColumn}
                        >
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

type DownloadBakerCredentialsStepProps = {
    accountAddress: string;
    bakerKeys: BakerKeys;
    onContinue: () => void;
};

export function DownloadBakerCredentialsStep({
    accountAddress,
    bakerKeys,
    onContinue,
}: DownloadBakerCredentialsStepProps) {
    const accountInfo = useAccountInfo(accountAddress);

    const onExport = async () => {
        if (accountInfo === undefined) {
            return;
        }
        const fileString = JSON.stringify({
            bakerId: accountInfo.accountIndex,
            aggregationSignKey: bakerKeys.aggregationSecret,
            aggregationVerifyKey: bakerKeys.aggregationPublic,
            electionPrivateKey: bakerKeys.electionSecret,
            electionVerifyKey: bakerKeys.electionPublic,
            signatureSignKey: bakerKeys.signatureSecret,
            signatureVerifyKey: bakerKeys.signaturePublic,
        });
        const success = await saveFile(fileString, {
            title: 'Save Baker Credentials',
            defaultPath: 'baker-credentials.json',
        });
        if (success) {
            onContinue();
        }
    };

    return (
        <div className={styles.columnContent}>
            <div className={styles.flex1}>
                <p className="mT0">
                    Your baker keys have been generated, and the public keys can
                    be seen to the left.
                </p>
                <p>
                    Make sure to export and backup your Baker Credentials, as
                    this will be the only chance to export them.
                </p>
                <p>
                    Baker credentials are used by the concordium node for baking
                    and contains private keys, which should only be transferred
                    on a secure channel.
                </p>
                <p>
                    If the Baker Credentials are lost or compromised, new ones
                    should be generated by updating Baker Keys.
                </p>
            </div>
            <Button onClick={onExport}>Export Baker Credentials</Button>
        </div>
    );
}
