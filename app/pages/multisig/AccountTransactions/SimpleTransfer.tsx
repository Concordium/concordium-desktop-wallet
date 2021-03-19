import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import { Grid } from 'semantic-ui-react';
import { Account, Identity, TransactionKindString } from '~/utils/types';
import SimpleTransfer from '~/components/Transfers/SimpleTransfer';
import PageLayout from '~/components/PageLayout';
import routes from '~/constants/routes.json';
import PickIdentity from '~/pages/GenerateCredential/PickIdentity';
import PickAccount from '~/pages/UpdateAccountCredentials/PickAccount';
import Button from '~/cross-app-components/Button';
import TransactionProposalDetails from './TransactionProposalDetails';

function nextLocation(currentLocation: string) {
    switch (currentLocation) {
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION:
            return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT;
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT:
            return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_MAKETRANSFER;
        default:
            throw new Error('unknown location');
    }
}
/**
 * This component controls the flow of creating a updateAccountCredential transaction.
 * It contains the logic for displaying the current parameters.
 */
export default function UpdateCredentialPage(): JSX.Element {
    const transactionKind = TransactionKindString.Transfer;
    const dispatch = useDispatch();
    const location = useLocation().pathname;
    const [isReady, setReady] = useState(false);
    const [account, setAccount] = useState<Account | undefined>();
    const [identity, setIdentity] = useState<Identity | undefined>();

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>
                    Multi Signature Transactions | Update Account Credentials
                </h1>
            </PageLayout.Header>
            <PageLayout.Container>
                <Grid columns="equal" centered>
                    <Grid.Row>
                        <Grid.Column>
                            <TransactionProposalDetails
                                transactionType={transactionKind}
                                account={account}
                                identity={identity}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <Switch>
                                <Route
                                    path={
                                        routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT
                                    }
                                    render={() => (
                                        <PickAccount
                                            setReady={setReady}
                                            setAccount={setAccount}
                                            identity={identity}
                                        />
                                    )}
                                />
                                <Route
                                    path={
                                        routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_MAKETRANSFER
                                    }
                                    render={() => {
                                        if (!account) {
                                            throw new Error(
                                                'Unexpected missing account'
                                            );
                                        }
                                        return (
                                            <SimpleTransfer account={account} />
                                        );
                                    }}
                                />
                                <Route
                                    path={
                                        routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION
                                    }
                                    render={() => (
                                        <PickIdentity
                                            setReady={setReady}
                                            setIdentity={setIdentity}
                                        />
                                    )}
                                />
                            </Switch>
                            {location ===
                            routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_MAKETRANSFER ? null : (
                                <Button
                                    disabled={!isReady}
                                    onClick={() => {
                                        setReady(false);
                                        dispatch(push(nextLocation(location)));
                                    }}
                                >
                                    Continue
                                </Button>
                            )}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </PageLayout.Container>
        </PageLayout>
    );
}
