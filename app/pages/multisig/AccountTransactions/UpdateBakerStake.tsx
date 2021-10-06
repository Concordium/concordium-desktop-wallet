import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useRouteMatch, useLocation } from 'react-router';
import { push } from 'connected-react-router';
import MultiSignatureLayout from '../MultiSignatureLayout/MultiSignatureLayout';
import Columns from '~/components/Columns';
import Button from '~/cross-app-components/Button';
import { BlockSummary } from '~/node/NodeApiTypes';
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
import SignTransaction from './SignTransaction';
import PickAmount from './PickAmount';
import UpdateBakerStakeProposalDetails from './proposal-details/UpdateBakerStakeProposalDetails';
import { microGtuToGtu, toMicroUnits } from '~/utils/gtu';
import InputTimestamp from '~/components/Form/InputTimestamp';
import { getFormattedDateString } from '~/utils/timeHelpers';
import PendingChange from '~/components/BakerPendingChange/BakerPendingChange';
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';
import { getNextAccountNonce } from '~/node/nodeRequests';
import errorMessages from '~/constants/errorMessages.json';
import LoadingComponent from './LoadingComponent';
import {
    BakerSubRoutes,
    getLocationAfterAccounts,
} from '~/utils/accountRouterHelpers';
import { ensureChainData, ChainData } from '../common/withChainData';

import styles from './MultisignatureAccountTransactions.module.scss';
import { isMultiSig } from '~/utils/accountHelpers';

function toMicroUnitsSafe(str: string | undefined) {
    if (str === undefined) {
        return undefined;
    }
    try {
        return toMicroUnits(str);
    } catch (error) {
        return undefined;
    }
}
interface PageProps extends ChainData {
    exchangeRate: Fraction;
    blockSummary: BlockSummary;
}

interface State {
    account?: Account;
}

function UpdateBakerStakePage({ exchangeRate, blockSummary }: PageProps) {
    const dispatch = useDispatch();

    const { state } = useLocation<State>();

    const { path, url } = useRouteMatch();
    const [account, setAccount] = useState<Account | undefined>(state?.account);
    const [stake, setStake] = useState<string>();
    const [error, setError] = useState<string>();
    const [transaction, setTransaction] = useState<UpdateBakerStake>();

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

        const payload = { stake: toMicroUnits(stake) };
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
        <MultiSignatureLayout
            pageTitle="Multi Signature Transactions | Update Baker Stake"
            stepTitle="Transaction Proposal - Update Baker Stake"
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
                <Columns.Column header="Transaction Details">
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
                                                        TransactionKindId.Update_baker_stake
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
                                    />
                                </div>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${BakerSubRoutes.stake}`}>
                        <Columns.Column
                            header="New staked amount"
                            className={styles.stretchColumn}
                        >
                            <div className={styles.columnContent}>
                                <div className={styles.flex1}>
                                    {account !== undefined ? (
                                        <PickNewStake
                                            account={account}
                                            stake={stake}
                                            setStake={setStake}
                                            blockSummary={blockSummary}
                                        />
                                    ) : null}
                                </div>
                                <Button
                                    className="mT40"
                                    disabled={stake === undefined}
                                    onClick={() => {
                                        dispatch(
                                            push(
                                                `${url}/${BakerSubRoutes.expiry}`
                                            )
                                        );
                                    }}
                                >
                                    Continue
                                </Button>
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
                                    onClick={() =>
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
                                >
                                    Continue
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${BakerSubRoutes.sign}`}>
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

type PickNewStakeProps = {
    account: Account;
    stake?: string;
    setStake: (s: string | undefined) => void;
    blockSummary: BlockSummary;
};

function PickNewStake({
    account,
    stake,
    setStake,
    blockSummary,
}: PickNewStakeProps) {
    const stakedAlready = useStakedAmount(account.address);
    const minimumThresholdForBaking = BigInt(
        blockSummary.updates.chainParameters.minimumThresholdForBaking
    );
    const cooldownUntil = useCalcBakerStakeCooldownUntil();
    const stakeGtu = toMicroUnitsSafe(stake);

    if (stakedAlready === undefined) {
        return null;
    }

    return (
        <>
            <PickAmount
                account={account}
                amount={microGtuToGtu(stakedAlready)}
                setAmount={setStake}
                validateAmount={(...args) =>
                    validateBakerStake(minimumThresholdForBaking, ...args)
                }
            />
            <p>Enter your new stake here</p>
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
