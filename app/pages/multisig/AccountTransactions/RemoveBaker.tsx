import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useRouteMatch, useLocation } from 'react-router';
import { push } from 'connected-react-router';
import MultiSignatureLayout from '../MultiSignatureLayout/MultiSignatureLayout';
import Columns from '~/components/Columns';
import {
    Account,
    TransactionKindId,
    RemoveBaker,
    Fraction,
} from '~/utils/types';
import PickAccount from '~/components/PickAccount';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import { createRemoveBakerTransaction } from '~/utils/transactionHelpers';
import routes from '~/constants/routes.json';
import {
    useCalcBakerStakeCooldownUntil,
    useTransactionCostEstimate,
} from '~/utils/dataHooks';
import SignTransaction from './SignTransaction';
import RemoveBakerProposalDetails from './proposal-details/RemoveBakerProposalDetails';
import { getFormattedDateString } from '~/utils/timeHelpers';
import PendingChange from '~/components/BakerPendingChange';
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';
import { getNextAccountNonce } from '~/node/nodeRequests';
import errorMessages from '~/constants/errorMessages.json';
import LoadingComponent from './LoadingComponent';
import {
    AccountTransactionSubRoutes,
    getLocationAfterAccounts,
} from '~/utils/accountRouterHelpers';
import ChooseExpiry from './ChooseExpiry';
import { isMultiSig } from '~/utils/accountHelpers';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';

import styles from '../common/MultiSignatureFlowPage.module.scss';

interface PageProps {
    exchangeRate: Fraction;
}

interface State {
    account?: Account;
}

function RemoveBakerPage({ exchangeRate }: PageProps) {
    const dispatch = useDispatch();

    const { state } = useLocation<State>();

    const { path, url } = useRouteMatch();
    const [account, setAccount] = useState<Account | undefined>(state?.account);
    const [error, setError] = useState<string>();
    const [transaction, setTransaction] = useState<RemoveBaker>();

    const handler = findAccountTransactionHandler(
        TransactionKindId.Remove_baker
    );

    const cooldownUntil = useCalcBakerStakeCooldownUntil();

    const estimatedFee = useTransactionCostEstimate(
        TransactionKindId.Remove_baker,
        exchangeRate,
        account?.signatureThreshold
    );
    const [expiryTime, setExpiryTime] = useState<Date>();

    const onCreateTransaction = async () => {
        if (account === undefined) {
            setError('Account is needed to make transaction');
            return;
        }

        const accountNonce = await getNextAccountNonce(account.address);
        setTransaction(
            createRemoveBakerTransaction(
                account.address,
                accountNonce.nonce,
                account?.signatureThreshold,
                expiryTime
            )
        );
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
            >
                <Columns.Column
                    header="Transaction details"
                    className={styles.stretchColumn}
                >
                    <div className={styles.columnContent}>
                        <RemoveBakerProposalDetails
                            account={account}
                            estimatedFee={estimatedFee}
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
                                <div className="flexChildFill">
                                    <PickAccount
                                        setAccount={setAccount}
                                        chosenAccount={account}
                                        filter={(a, info) =>
                                            info?.accountBaker !== undefined &&
                                            isMultiSig(a)
                                        }
                                        onAccountClicked={() => {
                                            dispatch(
                                                push(
                                                    getLocationAfterAccounts(
                                                        url,
                                                        TransactionKindId.Remove_baker
                                                    )
                                                )
                                            );
                                        }}
                                        isDisabled={(_, info) =>
                                            info?.accountBaker
                                                ?.pendingChange !==
                                            undefined ? (
                                                <>
                                                    The stake is frozen because:
                                                    <br />
                                                    <PendingChange
                                                        pending={
                                                            info.accountBaker
                                                                .pendingChange
                                                        }
                                                    />
                                                </>
                                            ) : undefined
                                        }
                                        messageWhenEmpty="There are no baker accounts that require multiple signatures"
                                    />
                                </div>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route
                        path={`${path}/${AccountTransactionSubRoutes.expiry}`}
                    >
                        <Columns.Column
                            header="Transaction expiry time"
                            className={styles.stretchColumn}
                        >
                            <ChooseExpiry
                                buttonText="Continue"
                                onClick={(expiry) => {
                                    setExpiryTime(expiry);
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
                                        );
                                }}
                            >
                                {cooldownUntil !== undefined ? (
                                    <p>
                                        Removing a baker will result in the
                                        baker stake being frozen until
                                        <br />
                                        {getFormattedDateString(cooldownUntil)}
                                        <br />
                                        where the actual removal of the baker
                                        will take effect.
                                    </p>
                                ) : null}
                            </ChooseExpiry>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${AccountTransactionSubRoutes.sign}`}>
                        <Columns.Column
                            header="Signature and hardware wallet"
                            className={styles.stretchColumn}
                        >
                            {transaction !== undefined &&
                            account !== undefined ? (
                                <SignTransaction
                                    transaction={transaction}
                                    account={account}
                                />
                            ) : null}
                        </Columns.Column>
                    </Route>
                </Switch>
            </Columns>
        </MultiSignatureLayout>
    );
}

export default ensureExchangeRate(RemoveBakerPage, LoadingComponent);
