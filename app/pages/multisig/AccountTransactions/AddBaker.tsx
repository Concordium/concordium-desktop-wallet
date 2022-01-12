import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Route,
    Switch,
    useRouteMatch,
    useLocation,
    Redirect,
} from 'react-router';
import { push } from 'connected-react-router';
import MultiSignatureLayout from '../MultiSignatureLayout/MultiSignatureLayout';
import Columns from '~/components/Columns';
import { BlockSummary } from '~/node/NodeApiTypes';
import {
    Account,
    TransactionKindId,
    AccountTransaction,
    AddBakerPayload,
    Fraction,
} from '~/utils/types';
import PickAccount from '~/components/PickAccount';
import { toMicroUnits } from '~/utils/gtu';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import { BakerKeys, generateBakerKeys } from '~/utils/rustInterface';
import SignTransactionColumn from '../SignTransactionProposal/SignTransaction';
import errorMessages from '~/constants/errorMessages.json';
import { ensureChainData, ChainData } from '../common/withChainData';
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';
import { getNextAccountNonce } from '~/node/nodeRequests';

import { createAddBakerTransaction } from '~/utils/transactionHelpers';
import { selectedProposalRoute } from '~/utils/routerHelper';
import routes from '~/constants/routes.json';
import { useTransactionCostEstimate } from '~/utils/dataHooks';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import {
    signUsingLedger,
    createMultisignatureTransaction,
} from './SignTransaction';
import { addProposal } from '~/features/MultiSignatureSlice';
import AddBakerProposalDetails from './proposal-details/AddBakerProposalDetails';
import LoadingComponent from './LoadingComponent';
import {
    AccountTransactionSubRoutes,
    getLocationAfterAccounts,
} from '~/utils/accountRouterHelpers';
import ChooseExpiry from './ChooseExpiry';
import AddBakerDetailsForm from '~/components/AddBakerDetailsForm';
import ExportBakerKeys from './ExportBakerKeys';
import { isMultiSig } from '~/utils/accountHelpers';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';

import styles from '../common/MultiSignatureFlowPage.module.scss';

interface PageProps extends ChainData {
    exchangeRate: Fraction;
    blockSummary: BlockSummary;
}

interface State {
    account?: Account;
}

function AddBakerPage({ exchangeRate, blockSummary }: PageProps) {
    const dispatch = useDispatch();

    const { state } = useLocation<State>();

    const { path, url } = useRouteMatch();
    const [account, setAccount] = useState<Account | undefined>(state?.account);
    const [stake, setStake] = useState<string>();
    const [restakeEnabled, setRestakeEnabled] = useState(true);
    const [error, setError] = useState<string>();
    const [bakerKeys, setBakerKeys] = useState<BakerKeys>();
    const [transaction, setTransaction] = useState<
        AccountTransaction<AddBakerPayload>
    >();
    const minimumThresholdForBaking = BigInt(
        blockSummary.updates.chainParameters.minimumThresholdForBaking
    );
    const [expiryTime, setExpiryTime] = useState<Date>();

    const estimatedFee = useTransactionCostEstimate(
        TransactionKindId.Add_baker,
        exchangeRate,
        account?.signatureThreshold
    );

    const handler = findAccountTransactionHandler(TransactionKindId.Add_baker);

    const onGenerateKeys = () => {
        if (account === undefined) {
            setError('An account is needed to generate baker keys');
            return;
        }
        generateBakerKeys(account.address, 'ADD')
            .then((keys) => setBakerKeys(keys))
            .catch(() => setError('Failed generating baker keys'));
    };

    const onCreateTransaction = async () => {
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
        const accountNonce = await getNextAccountNonce(account.address);
        setTransaction(
            createAddBakerTransaction(
                account.address,
                payload,
                accountNonce.nonce,
                account.signatureThreshold,
                expiryTime
            )
        );
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
        <MultiSignatureLayout pageTitle={handler.title} delegateScroll>
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
                <Columns.Column header="Transaction details">
                    <div className={styles.columnContent}>
                        <AddBakerProposalDetails
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
                            header="Accounts"
                            className={styles.stretchColumn}
                        >
                            <div className={styles.columnContent}>
                                <div className="flexChildFill">
                                    <PickAccount
                                        setAccount={setAccount}
                                        chosenAccount={account}
                                        filter={(a, info) =>
                                            info?.accountBaker === undefined &&
                                            isMultiSig(a)
                                        }
                                        onAccountClicked={() =>
                                            dispatch(
                                                push(
                                                    getLocationAfterAccounts(
                                                        url,
                                                        TransactionKindId.Add_baker
                                                    )
                                                )
                                            )
                                        }
                                        messageWhenEmpty="There are no accounts that require multiple signatures, which can become bakers"
                                    />
                                </div>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route
                        path={`${path}/${AccountTransactionSubRoutes.stake}`}
                    >
                        {!account ? (
                            <Redirect to={path} />
                        ) : (
                            <Columns.Column
                                header="Stake"
                                className={styles.stretchColumn}
                            >
                                <AddBakerDetailsForm
                                    className={styles.columnContent}
                                    minimumStake={minimumThresholdForBaking}
                                    showAccountCard
                                    account={account}
                                    estimatedFee={estimatedFee}
                                    onSubmit={(values) => {
                                        setStake(values.stake);
                                        setRestakeEnabled(values.restake);
                                        dispatch(
                                            push(
                                                `${url}/${AccountTransactionSubRoutes.expiry}`
                                            )
                                        );
                                    }}
                                />
                            </Columns.Column>
                        )}
                    </Route>

                    <Route
                        path={`${path}/${AccountTransactionSubRoutes.expiry}`}
                    >
                        <Columns.Column
                            header="Transaction expiry time"
                            className={styles.stretchColumn}
                        >
                            <ChooseExpiry
                                buttonText="Generate keys"
                                onClick={(expiry: Date) => {
                                    setExpiryTime(expiry);
                                    onGenerateKeys();
                                    dispatch(
                                        push(
                                            `${url}/${AccountTransactionSubRoutes.keys}`
                                        )
                                    );
                                }}
                            />
                        </Columns.Column>
                    </Route>

                    <Route path={`${path}/${AccountTransactionSubRoutes.keys}`}>
                        <Columns.Column
                            header="Baker keys"
                            className={styles.stretchColumn}
                        >
                            <ExportBakerKeys
                                className={styles.columnContent}
                                accountAddress={account?.address}
                                bakerKeys={bakerKeys}
                                onContinue={() =>
                                    onCreateTransaction()
                                        .then(() =>
                                            dispatch(
                                                push(
                                                    `${url}/${AccountTransactionSubRoutes.sign}`
                                                )
                                            )
                                        )
                                        .catch(() =>
                                            setError(
                                                errorMessages.unableToReachNode
                                            )
                                        )
                                }
                            />
                        </Columns.Column>
                    </Route>

                    <Route path={`${path}/${AccountTransactionSubRoutes.sign}`}>
                        <Columns.Column header="Signature and hardware wallet">
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

export default ensureExchangeRate(
    ensureChainData(AddBakerPage, LoadingComponent),
    LoadingComponent
);
