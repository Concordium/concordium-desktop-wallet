import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useRouteMatch, useLocation } from 'react-router';
import { push } from 'connected-react-router';
import MultiSignatureLayout from '../MultiSignatureLayout/MultiSignatureLayout';
import Columns from '~/components/Columns';
import Button from '~/cross-app-components/Button';
import {
    Account,
    TransactionKindId,
    UpdateBakerKeysPayload,
    UpdateBakerKeys,
    Fraction,
} from '~/utils/types';
import PickAccount from '~/components/PickAccount';
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
} from '~/utils/dataHooks';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { addProposal } from '~/features/MultiSignatureSlice';
import UpdateBakerKeysProposalDetails from './proposal-details/UpdateBakerKeysProposalDetails';
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';
import { getNextAccountNonce } from '~/node/nodeRequests';
import errorMessages from '~/constants/errorMessages.json';
import LoadingComponent from './LoadingComponent';
import {
    BakerSubRoutes,
    getLocationAfterAccounts,
} from '~/utils/accountRouterHelpers';
import { throwLoggedError } from '~/utils/basicHelpers';
import DatePicker from '~/components/Form/DatePicker';
import ExportBakerKeys from './ExportBakerKeys';
import { isMultiSig } from '~/utils/accountHelpers';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';

import styles from './MultisignatureAccountTransactions.module.scss';

interface PageProps {
    exchangeRate: Fraction;
}

interface State {
    account?: Account;
}

function UpdateBakerKeysPage({ exchangeRate }: PageProps) {
    const dispatch = useDispatch();

    const { state } = useLocation<State>();

    const { path, url } = useRouteMatch();
    const [account, setAccount] = useState<Account | undefined>(state?.account);
    const [error, setError] = useState<string>();
    const [bakerKeys, setBakerKeys] = useState<BakerKeys>();
    const [transaction, setTransaction] = useState<UpdateBakerKeys>();
    const handler = findAccountTransactionHandler(
        TransactionKindId.Remove_baker
    );

    const estimatedFee = useTransactionCostEstimate(
        TransactionKindId.Update_baker_keys,
        exchangeRate,
        account?.signatureThreshold
    );

    const [
        expiryTime,
        setExpiryTime,
        expiryTimeError,
    ] = useTransactionExpiryState();

    useEffect(() => {
        if (error) {
            window.log.error(error);
        }
    }, [error]);

    const onGenerateKeys = () => {
        if (account === undefined) {
            setError('An account is needed to generate baker keys');
            return;
        }
        generateBakerKeys(account.address, 'UPDATE')
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

        const payload: UpdateBakerKeysPayload = {
            electionVerifyKey: bakerKeys.electionPublic,
            signatureVerifyKey: bakerKeys.signaturePublic,
            aggregationVerifyKey: bakerKeys.aggregationPublic,
            proofElection: bakerKeys.proofElection,
            proofSignature: bakerKeys.proofSignature,
            proofAggregation: bakerKeys.proofAggregation,
        };

        const accountNonce = await getNextAccountNonce(account.address);
        setTransaction(
            createUpdateBakerKeysTransaction(
                account.address,
                payload,
                accountNonce.nonce,
                account?.signatureThreshold,
                expiryTime
            )
        );
    };

    const signingFunction = async (ledger?: ConcordiumLedgerClient) => {
        if (!account) {
            throwLoggedError('unexpected missing account');
        }
        if (transaction === undefined) {
            throwLoggedError('unexpected missing transaction');
        }
        if (bakerKeys === undefined) {
            throwLoggedError('unexpected missing bakerKeys');
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
            throwLoggedError('unexpected undefined proposal id');
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
                        <UpdateBakerKeysProposalDetails
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
                    </div>
                </Columns.Column>
                <Switch>
                    <Route exact path={path}>
                        <Columns.Column
                            header="Accounts"
                            className={styles.stretchColumn}
                        >
                            <div className={styles.columnContent}>
                                <div className={styles.flex1}>
                                    <PickAccount
                                        setAccount={setAccount}
                                        chosenAccount={account}
                                        filter={(a, info) =>
                                            info?.accountBaker !== undefined &&
                                            isMultiSig(a)
                                        }
                                        messageWhenEmpty="There are no baker accounts that require multiple signatures"
                                        onAccountClicked={() => {
                                            dispatch(
                                                push(
                                                    getLocationAfterAccounts(
                                                        url,
                                                        TransactionKindId.Update_baker_keys
                                                    )
                                                )
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${BakerSubRoutes.expiry}`}>
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
                                    <DatePicker
                                        className="body2 mV40"
                                        label="Transaction expiry time"
                                        name="expiry"
                                        isInvalid={
                                            expiryTimeError !== undefined
                                        }
                                        error={expiryTimeError}
                                        value={expiryTime}
                                        onChange={setExpiryTime}
                                        minDate={new Date()}
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
                                                `${url}/${BakerSubRoutes.keys}`
                                            )
                                        );
                                    }}
                                >
                                    Generate keys
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${BakerSubRoutes.keys}`}>
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
                                                    `${url}/${BakerSubRoutes.sign}`
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
                    <Route path={`${path}/${BakerSubRoutes.sign}`}>
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

export default ensureExchangeRate(UpdateBakerKeysPage, LoadingComponent);
