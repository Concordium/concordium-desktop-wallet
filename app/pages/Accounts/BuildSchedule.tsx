import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { Card, List, Header, Button } from 'semantic-ui-react';
import { LocationDescriptorObject } from 'history';
import routes from '../../constants/routes.json';
import { Account, AddressBookEntry, Schedule } from '../../utils/types';
import { displayAsGTU } from '../../utils/gtu';
import { createScheduledTransferTransaction } from '../../utils/transactionHelpers';
import locations from '../../constants/transferLocations.json';
import RegularInterval from './BuildRegularInterval';
import ExplicitSchedule from './BuildExplicitSchedule';

interface State {
    account: Account;
    amount: string;
    recipient: AddressBookEntry;
}

interface Props {
    location: LocationDescriptorObject<State>;
}

/**
 * Allows the user to build the schedule of a scheduled transfer.
 */
export default function BuildSchedule({ location }: Props) {
    const [explicit, setExplicit] = useState<boolean>(false);
    const dispatch = useDispatch();

    if (!location.state) {
        throw new Error('Unexpected missing state.');
    }

    const { account, amount, recipient } = location.state;

    async function createTransaction(schedule: Schedule) {
        const transaction = await createScheduledTransferTransaction(
            account.address,
            recipient.address,
            schedule
        );
        dispatch(
            push({
                pathname: routes.SUBMITTRANSFER,
                state: {
                    returnLocation:
                        routes.ACCOUNTS_MORE_CREATESCHEDULEDTRANSFER,
                    returnState: {
                        recipient,
                        initialPage: locations.transferSubmitted,
                    },
                    transaction,
                    account,
                },
            })
        );
    }

    const BuildComponent = explicit ? ExplicitSchedule : RegularInterval;

    return (
        <Card fluid>
            <Button
                as={Link}
                to={{
                    pathname: routes.ACCOUNTS_MORE_CREATESCHEDULEDTRANSFER,
                    state: { amount, recipient },
                }}
            >
                {'<--'}
            </Button>
            <Header> Send fund with a release schedule</Header>
            <Button as={Link} to={routes.ACCOUNTS}>
                x
            </Button>

            <List>
                <List.Item>
                    <Header textAlign="center">
                        Send funds {displayAsGTU(amount)} to {recipient.name}
                    </Header>
                </List.Item>
                <List.Item>
                    <Button
                        onClick={() => setExplicit(false)}
                        disabled={!explicit}
                    >
                        Regular Interval
                    </Button>
                    <Button
                        onClick={() => setExplicit(true)}
                        disabled={explicit}
                    >
                        Explicit schedule
                    </Button>
                </List.Item>

                <BuildComponent
                    submitSchedule={createTransaction}
                    amount={BigInt(amount)}
                />
            </List>
        </Card>
    );
}
