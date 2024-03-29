import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useRouteMatch, useLocation } from 'react-router';
import { push } from 'connected-react-router';
import { isBakerAccount } from '@concordium/web-sdk';
import MultiSignatureLayout from '../../MultiSignatureLayout/MultiSignatureLayout';
import Columns from '~/components/Columns';
import Button from '~/cross-app-components/Button';
import { ChainParameters } from '~/node/NodeApiTypes';
import {
    Account,
    TransactionKindId,
    UpdateBakerStake,
    Fraction,
} from '~/utils/types';
import PickAccount from '~/components/PickAccount';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import {
    createUpdateBakerStakeTransaction,
    validateBakerStake,
} from '~/utils/transactionHelpers';
import routes from '~/constants/routes.json';
import {
    useCalcBakerStakeCooldownUntil,
    useStakedAmount,
    useTransactionCostEstimate,
    useTransactionExpiryState,
} from '~/utils/dataHooks';
import SignTransaction from '../SignTransaction';
import PickAmount from '../PickAmount';
import UpdateBakerStakeProposalDetails from '../proposal-details/UpdateBakerStakeProposalDetails';
import { getFormattedDateString } from '~/utils/timeHelpers';
import StakePendingChange from '~/components/StakePendingChange';
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';
import { getNextAccountNonce } from '~/node/nodeRequests';
import errorMessages from '~/constants/errorMessages.json';
import LoadingComponent from '../LoadingComponent';
import {
    AccountTransactionSubRoutes,
    getLocationAfterAccounts,
} from '~/utils/accountRouterHelpers';
import { ensureChainData, ChainData } from '~/utils/withChainData';
import DatePicker from '~/components/Form/DatePicker';
import { isMultiSig } from '~/utils/accountHelpers';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import { ccdToMicroCcd, microCcdToCcd } from '~/utils/ccd';

import styles from '../../common/MultiSignatureFlowPage.module.scss';
import { getMinimumStakeForBaking } from '~/utils/blockSummaryHelpers';

function toMicroUnitsSafe(str: string | undefined) {
    if (str === undefined) {
        return undefined;
    }
    try {
        return ccdToMicroCcd(str);
    } catch (error) {
        return undefined;
    }
}
interface PageProps extends ChainData {
    exchangeRate: Fraction;
    chainParameters: ChainParameters;
}

interface State {
    account?: Account;
}

function UpdateBakerStakePage({ exchangeRate, chainParameters }: PageProps) {
    const dispatch = useDispatch();

    const { state } = useLocation<State>();

    const { path, url } = useRouteMatch();
    const [account, setAccount] = useState<Account | undefined>(state?.account);
    const [stake, setStake] = useState<string>();
    const [error, setError] = useState<string>();
    const [transaction, setTransaction] = useState<UpdateBakerStake>();
    const handler = findAccountTransactionHandler(
        TransactionKindId.Update_baker_stake
    );

    const estimatedFee = useTransactionCostEstimate(
        TransactionKindId.Update_baker_stake,
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

        if (stake === undefined) {
            setError('Stake is needed to make transaction');
            return;
        }

        const payload = { stake: ccdToMicroCcd(stake) };
        const accountNonce = await getNextAccountNonce(account.address);
        setTransaction(
            createUpdateBakerStakeTransaction(
                account.address,
                payload,
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
                <Columns.Column header="Transaction details">
                    <div className={styles.columnContent}>
                        <UpdateBakerStakeProposalDetails
                            account={account}
                            estimatedFee={estimatedFee}
                            stake={toMicroUnitsSafe(stake)}
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
                                            info !== undefined &&
                                            isBakerAccount(info) &&
                                            isMultiSig(a)
                                        }
                                        messageWhenEmpty="There are no baker accounts that require multiple signatures"
                                        onAccountClicked={() => {
                                            dispatch(
                                                push(
                                                    getLocationAfterAccounts(
                                                        url,
                                                        TransactionKindId.Update_baker_stake
                                                    )
                                                )
                                            );
                                        }}
                                        isDisabled={(_, info) =>
                                            info !== undefined &&
                                            isBakerAccount(info) &&
                                            info.accountBaker.pendingChange !==
                                                undefined ? (
                                                <>
                                                    The stake is frozen because:
                                                    <br />
                                                    <StakePendingChange
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
                    <Route
                        path={`${path}/${AccountTransactionSubRoutes.stake}`}
                    >
                        <Columns.Column
                            header="New staked amount"
                            className={styles.stretchColumn}
                        >
                            <div className={styles.columnContent}>
                                <div className="flexChildFill">
                                    {account !== undefined ? (
                                        <PickNewStake
                                            account={account}
                                            stake={stake}
                                            setStake={setStake}
                                            chainParameters={chainParameters}
                                            estimatedFee={estimatedFee}
                                        />
                                    ) : null}
                                </div>
                                <Button
                                    className="mT40"
                                    disabled={stake === undefined}
                                    onClick={() => {
                                        dispatch(
                                            push(
                                                `${url}/${AccountTransactionSubRoutes.expiry}`
                                            )
                                        );
                                    }}
                                >
                                    Continue
                                </Button>
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
                            <div className={styles.columnContent}>
                                <div className="flexChildFill">
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
                                    onClick={() =>
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
                                >
                                    Continue
                                </Button>
                            </div>
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

type PickNewStakeProps = {
    account: Account;
    stake?: string;
    setStake: (s: string | undefined) => void;
    chainParameters: ChainParameters;
    estimatedFee: Fraction;
};

function PickNewStake({
    account,
    stake,
    setStake,
    chainParameters,
    estimatedFee,
}: PickNewStakeProps) {
    const stakedAlready = useStakedAmount(account.address);
    const minimumThresholdForBaking = getMinimumStakeForBaking(chainParameters);
    const cooldownUntil = useCalcBakerStakeCooldownUntil();
    const stakeGtu = toMicroUnitsSafe(stake);

    if (stakedAlready === undefined) {
        return null;
    }

    return (
        <>
            <PickAmount
                account={account}
                amount={microCcdToCcd(stakedAlready)}
                existing={microCcdToCcd(stakedAlready)}
                setAmount={setStake}
                validateAmount={(...args) =>
                    validateBakerStake(minimumThresholdForBaking, ...args)
                }
                estimatedFee={estimatedFee}
            />
            {cooldownUntil !== undefined &&
            stakeGtu !== undefined &&
            stakedAlready !== undefined &&
            stakeGtu < stakedAlready ? (
                <p>
                    You are decreasing the baker stake and the stake will be
                    frozen until <br />
                    {getFormattedDateString(cooldownUntil)}
                    <br /> where the actual decrease will take effect.
                </p>
            ) : null}
        </>
    );
}

export default ensureExchangeRate(
    ensureChainData(UpdateBakerStakePage, LoadingComponent),
    LoadingComponent
);
