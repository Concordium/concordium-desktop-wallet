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
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import { createRemoveBakerTransaction } from '~/utils/transactionHelpers';
import routes from '~/constants/routes.json';
import { useTransactionCostEstimate } from '~/utils/hooks';
import SignTransaction from './SignTransaction';

const placeholderText = 'To be determined';

enum SubRoutes {
    accounts,
    sign,
}

export default function RemoveBakerPage() {
    const dispatch = useDispatch();
    const { path, url } = useRouteMatch();
    const [identity, setIdentity] = useState<Identity>();
    const [account, setAccount] = useState<Account>();
    const [error, setError] = useState<string>();
    const [transaction, setTransaction] = useState<RemoveBaker>();

    const estimatedFee = useTransactionCostEstimate(
        TransactionKindId.Remove_baker,
        account?.signatureThreshold
    );

    const onCreateTransaction = () => {
        if (account === undefined) {
            setError('Account is needed to make transaction');
            return;
        }

        createRemoveBakerTransaction(account.address)
            .then(setTransaction)
            .catch(() => setError('Failed create transaction'));
    };

    return (
        <MultiSignatureLayout
            pageTitle="Multi Signature Transactions | Remove Baker"
            stepTitle="Transaction Proposal - Remove Baker"
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
                    </div>
                </Columns.Column>
                <Switch>
                    <Route exact path={path}>
                        <Columns.Column header="Identities">
                            <div className={styles.descriptionStep}>
                                <div className={styles.flex1}>
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
