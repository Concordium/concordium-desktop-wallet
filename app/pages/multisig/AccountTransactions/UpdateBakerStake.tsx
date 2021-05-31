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
    RemoveBaker,
} from '~/utils/types';
import PickIdentity from '~/components/PickIdentity';
import PickAccount from './PickAccount';
import styles from './MultisignatureAccountTransactions.module.scss';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import {
    createUpdateBakerStakeTransaction,
    validateBakerStake,
} from '~/utils/transactionHelpers';
import routes from '~/constants/routes.json';
import {
    useCalcBakerStakeCooldownUntil,
    useChainParameters,
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

enum SubRoutes {
    accounts,
    stake,
    sign,
    expiry,
}

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

export default function UpdateBakerStakePage() {
    const dispatch = useDispatch();
    const { path, url } = useRouteMatch();
    const [identity, setIdentity] = useState<Identity>();
    const [account, setAccount] = useState<Account>();
    const [stake, setStake] = useState<string>();
    const [error, setError] = useState<string>();
    const [transaction, setTransaction] = useState<RemoveBaker>();

    const estimatedFee = useTransactionCostEstimate(
        TransactionKindId.Update_baker_stake,
        account?.signatureThreshold
    );
    const [
        expiryTime,
        setExpiryTime,
        expiryTimeError,
    ] = useTransactionExpiryState();

    const onCreateTransaction = () => {
        if (account === undefined) {
            setError('Account is needed to make transaction');
            return;
        }

        if (stake === undefined) {
            setError('Stake is needed to make transaction');
            return;
        }

        const payload = { stake: toMicroUnits(stake) };
        createUpdateBakerStakeTransaction(account.address, payload)
            .then(setTransaction)
            .catch((err) => setError(`Failed create transaction ${err}`));
    };

    return (
        <MultiSignatureLayout
            pageTitle="Multi Signature Transactions | Update Baker Stake"
            stepTitle="Transaction Proposal - Update Baker Stake"
        >
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to perform transfer"
                content={error}
                onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
            />
            <Columns divider columnScroll>
                <Columns.Column header="Transaction Details" verticalPadding>
                    <UpdateBakerStakeProposalDetails
                        identity={identity}
                        account={account}
                        estimatedFee={estimatedFee}
                        stake={toMicroUnitsSafe(stake)}
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
                                            push(`${url}/${SubRoutes.accounts}`)
                                        )
                                    }
                                >
                                    Continue
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${SubRoutes.accounts}`}>
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
                                            push(`${url}/${SubRoutes.stake}`)
                                        );
                                    }}
                                >
                                    Continue
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${SubRoutes.stake}`}>
                        <Columns.Column header="New staked amount">
                            <div className={styles.descriptionStep}>
                                <div className={styles.flex1}>
                                    {account !== undefined ? (
                                        <PickNewStake
                                            account={account}
                                            stake={stake}
                                            setStake={setStake}
                                        />
                                    ) : null}
                                </div>
                                <Button
                                    disabled={stake === undefined}
                                    onClick={() => {
                                        dispatch(
                                            push(`${url}/${SubRoutes.expiry}`)
                                        );
                                    }}
                                >
                                    Continue
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${SubRoutes.expiry}`}>
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
                                        onCreateTransaction();
                                        dispatch(
                                            push(`${url}/${SubRoutes.sign}`)
                                        );
                                    }}
                                >
                                    Continue
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${SubRoutes.sign}`}>
                        <Columns.Column header="Signature and Hardware Wallet">
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
};

function PickNewStake({ account, stake, setStake }: PickNewStakeProps) {
    const stakedAlready = useStakedAmount(account.address);
    const chainParameters = useChainParameters();
    const minimumThresholdForBaking =
        chainParameters !== undefined
            ? BigInt(chainParameters.minimumThresholdForBaking)
            : undefined;
    const cooldownUntil = useCalcBakerStakeCooldownUntil();
    const stakeGtu = toMicroUnitsSafe(stake);

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
