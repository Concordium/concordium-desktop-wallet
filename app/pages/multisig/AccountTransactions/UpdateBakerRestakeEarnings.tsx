import React, { useEffect, useState } from 'react';
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
import { createUpdateBakerRestakeEarningsTransaction } from '~/utils/transactionHelpers';
import routes from '~/constants/routes.json';
import {
    useAccountInfo,
    useTransactionCostEstimate,
    useTransactionExpiryState,
} from '~/utils/dataHooks';
import SignTransaction from './SignTransaction';
import ButtonGroup from '~/components/ButtonGroup';
import UpdateBakerRestakeEarningsProposalDetails from './proposal-details/UpdateBakerRestakeEarnings';
import InputTimestamp from '~/components/Form/InputTimestamp';

enum SubRoutes {
    accounts,
    restake,
    sign,
    expiry,
}

export default function UpdateBakerRestakeEarningsPage() {
    const dispatch = useDispatch();
    const { path, url } = useRouteMatch();
    const [identity, setIdentity] = useState<Identity>();
    const [account, setAccount] = useState<Account>();
    const [restakeEarnings, setRestakeEarnings] = useState<boolean>();
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

        if (restakeEarnings === undefined) {
            setError(
                'The Restake Earnings setting is needed to make transaction'
            );
            return;
        }

        const payload = { restakeEarnings };
        createUpdateBakerRestakeEarningsTransaction(account.address, payload)
            .then(setTransaction)
            .catch((err) => setError(`Failed create transaction ${err}`));
    };

    return (
        <MultiSignatureLayout
            pageTitle="Multi Signature Transactions | Update Baker Restake Earnings"
            stepTitle="Transaction Proposal - Update Baker Restake Earnings"
            delegateScroll
        >
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to perform transfer"
                content={error}
                onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
            />
            <Columns divider columnScroll>
                <Columns.Column
                    header="Transaction Details"
                    className={styles.stretchColumn}
                >
                    <div className={styles.columnContent}>
                        <UpdateBakerRestakeEarningsProposalDetails
                            identity={identity}
                            account={account}
                            estimatedFee={estimatedFee}
                            restakeEarnings={restakeEarnings}
                            expiryTime={expiryTime}
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
                                            info?.accountBaker !== undefined
                                        }
                                    />
                                </div>
                                <Button
                                    className={styles.listSelectButton}
                                    disabled={account === undefined}
                                    onClick={() => {
                                        dispatch(
                                            push(`${url}/${SubRoutes.restake}`)
                                        );
                                    }}
                                >
                                    Continue
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${SubRoutes.restake}`}>
                        <Columns.Column
                            header="Restake earnings"
                            className={styles.stretchColumn}
                        >
                            <div className={styles.columnContent}>
                                <div className={styles.flex1}>
                                    {account !== undefined ? (
                                        <RestakeEarnings
                                            enable={restakeEarnings}
                                            accountAddress={account?.address}
                                            onChanged={setRestakeEarnings}
                                        />
                                    ) : null}
                                </div>
                                <Button
                                    className="mT40"
                                    disabled={restakeEarnings === undefined}
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

type RestakeEarningsProps = {
    accountAddress: string;
    enable?: boolean;
    onChanged: (enable: boolean) => void;
};

function RestakeEarnings({
    accountAddress,
    enable,
    onChanged,
}: RestakeEarningsProps) {
    const accountInfo = useAccountInfo(accountAddress);
    const restake = accountInfo?.accountBaker?.restakeEarnings;

    useEffect(() => {
        if (enable === undefined && restake !== undefined) {
            onChanged(restake);
        }
    }, [restake, enable, onChanged]);

    return (
        <>
            <p className="mT0">
                Currently restake is{' '}
                {restake ? <b>enabled</b> : <b>disabled</b>}.
            </p>
            <p>Select whether to restake earnings.</p>
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
                isSelected={({ value }) => value === enable}
                onClick={({ value }) => onChanged(value)}
            />
        </>
    );
}
