import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useRouteMatch } from 'react-router';
import { push } from 'connected-react-router';
import MultiSignatureLayout from '../MultiSignatureLayout/MultiSignatureLayout';
import Columns from '~/components/Columns';
import Button from '~/cross-app-components/Button';
import {
    Account,
    TransactionKindId,
    RemoveBaker,
    Fraction,
} from '~/utils/types';
import PickAccount from '~/components/PickAccount';
import styles from './MultisignatureAccountTransactions.module.scss';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import { createRemoveBakerTransaction } from '~/utils/transactionHelpers';
import routes from '~/constants/routes.json';
import {
    useCalcBakerStakeCooldownUntil,
    useTransactionCostEstimate,
    useTransactionExpiryState,
} from '~/utils/dataHooks';
import SignTransaction from './SignTransaction';
import RemoveBakerProposalDetails from './proposal-details/RemoveBakerProposalDetails';
import InputTimestamp from '~/components/Form/InputTimestamp';
import { getFormattedDateString } from '~/utils/timeHelpers';
import PendingChange from '~/components/BakerPendingChange/BakerPendingChange';
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';
import { getNextAccountNonce } from '~/node/nodeRequests';
import errorMessages from '~/constants/errorMessages.json';
import LoadingComponent from './LoadingComponent';

enum SubRoutes {
    sign,
    expiry,
}

interface PageProps {
    exchangeRate: Fraction;
}

function RemoveBakerPage({ exchangeRate }: PageProps) {
    const dispatch = useDispatch();
    const { path, url } = useRouteMatch();
    const [account, setAccount] = useState<Account>();
    const [error, setError] = useState<string>();
    const [transaction, setTransaction] = useState<RemoveBaker>();

    const cooldownUntil = useCalcBakerStakeCooldownUntil();

    const estimatedFee = useTransactionCostEstimate(
        TransactionKindId.Remove_baker,
        exchangeRate,
        account?.signatureThreshold
    );
    const [
        expiryTime,
        setExpiryTime,
        expiryTimeError,
    ] = useTransactionExpiryState();

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
        <MultiSignatureLayout
            pageTitle="Multi Signature Transactions | Remove Baker"
            stepTitle="Transaction Proposal - Remove Baker"
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
            >
                <Columns.Column
                    header="Transaction Details"
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
                                <div className={styles.flex1}>
                                    <PickAccount
                                        setAccount={setAccount}
                                        chosenAccount={account}
                                        filter={(_, info) =>
                                            info?.accountBaker !== undefined
                                        }
                                        onAccountClicked={() => {
                                            dispatch(
                                                push(
                                                    `${url}/${SubRoutes.expiry}`
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
                                    />
                                </div>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${SubRoutes.expiry}`}>
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
                                    {cooldownUntil !== undefined ? (
                                        <p>
                                            Remove a baker will result in the
                                            baker stake being frozen until
                                            <br />
                                            {getFormattedDateString(
                                                cooldownUntil
                                            )}
                                            <br />
                                            where the actual removing of the
                                            baker will take effect.
                                        </p>
                                    ) : null}
                                </div>
                                <Button
                                    className="mT40"
                                    disabled={
                                        expiryTime === undefined ||
                                        expiryTimeError !== undefined
                                    }
                                    onClick={() =>
                                        onCreateTransaction()
                                            .then(() =>
                                                dispatch(
                                                    push(
                                                        `${url}/${SubRoutes.sign}`
                                                    )
                                                )
                                            )
                                            .catch(() =>
                                                setError(
                                                    errorMessages.unableToReachNode
                                                )
                                            )
                                    }
                                >
                                    Continue
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${SubRoutes.sign}`}>
                        <Columns.Column
                            header="Signature and Hardware Wallet"
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
