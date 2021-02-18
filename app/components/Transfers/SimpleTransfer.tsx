import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route, Link } from 'react-router-dom';
import { push } from 'connected-react-router';

import { Button, Header, Grid } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import ConfirmTransfer from './ConfirmTransfer';
import PickRecipient from './PickRecipient';
import PickAmount from './PickAmount';
import FinalPage from './FinalPage';
import { AddressBookEntry, Account } from '../../utils/types';
import { toMicroUnits } from '../../utils/gtu';

interface Props {
    account: Account;
}

/**
 * Controls the flow of creating a simple transfer.
 */
export default function SimpleTransfer({ account }: Props) {
    const dispatch = useDispatch();

    const [amount, setAmount] = useState<string>(''); // This is a string, to allows user input in GTU
    const [recipient, setRecipient] = useState<AddressBookEntry | undefined>(
        undefined
    );

    function chooseRecipientOnClick(entry: AddressBookEntry) {
        setRecipient(entry);
        dispatch(push(routes.ACCOUNTS_SIMPLETRANSFER_PICKAMOUNT));
    }

    return (
        <>
            <Grid columns="3">
                <Grid.Column>
                    <Switch>
                        <Route
                            path={[
                                routes.ACCOUNTS_SIMPLETRANSFER_PICKRECIPIENT,
                                routes.ACCOUNTS_SIMPLETRANSFER_CONFIRMTRANSFER,
                            ]}
                            render={() => (
                                <Button
                                    onClick={() =>
                                        dispatch(
                                            push(
                                                routes.ACCOUNTS_SIMPLETRANSFER_PICKAMOUNT
                                            )
                                        )
                                    }
                                >
                                    {'<--'}
                                </Button>
                            )}
                        />
                    </Switch>
                </Grid.Column>
                <Grid.Column textAlign="center">
                    <Header>Send Transfer</Header>
                </Grid.Column>
                <Grid.Column textAlign="right">
                    <Link to={routes.ACCOUNTS}>
                        <Button>x</Button>
                    </Link>
                </Grid.Column>
            </Grid>
            <Switch>
                <Route
                    path={routes.ACCOUNTS_SIMPLETRANSFER_PICKRECIPIENT}
                    render={() => (
                        <PickRecipient pickRecipient={chooseRecipientOnClick} />
                    )}
                />
                <Route
                    path={routes.ACCOUNTS_SIMPLETRANSFER_CONFIRMTRANSFER}
                    render={() => {
                        if (!recipient) {
                            return null;
                        }
                        return (
                            <ConfirmTransfer
                                recipient={recipient}
                                amount={toMicroUnits(amount)}
                                account={account}
                            />
                        );
                    }}
                />
                <Route
                    path={routes.ACCOUNTS_SIMPLETRANSFER_TRANSFERSUBMITTED}
                    component={FinalPage}
                />
                <Route
                    path={[
                        routes.ACCOUNTS_SIMPLETRANSFER_PICKAMOUNT,
                        routes.ACCOUNTS_SIMPLETRANSFER,
                    ]}
                    render={() => (
                        <PickAmount
                            recipient={recipient}
                            amount={amount}
                            setAmount={setAmount}
                        />
                    )}
                />
            </Switch>
        </>
    );
}
