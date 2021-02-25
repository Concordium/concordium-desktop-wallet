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
import RegularInterval, {
    Defaults as RegularIntervalDefaults,
} from './BuildRegularInterval';
import ExplicitSchedule, {
    Defaults as ExplicitScheduleDefaults,
} from './BuildExplicitSchedule';

interface Defaults extends ExplicitScheduleDefaults, RegularIntervalDefaults {}

interface State {
    account: Account;
    amount: string;
    recipient: AddressBookEntry;
    explicit: boolean;
    defaults: Defaults;
}

interface Props {
    location: LocationDescriptorObject<State>;
}

/**
 * Allows the user to build the schedule of a scheduled transfer.
 */
export default function BuildSchedule({ location }: Props) {
    const [explicit, setExplicit] = useState<boolean>(
        location?.state?.explicit || false
    );
    const dispatch = useDispatch();

    if (!location.state) {
        throw new Error('Unexpected missing state.');
    }

    const { account, amount, recipient, defaults } = location.state;

    async function createTransaction(
        schedule: Schedule,
        recoverState: unknown
    ) {
        const transaction = await createScheduledTransferTransaction(
            account.address,
            recipient.address,
            schedule
        );
        dispatch(
            push({
                pathname: routes.SUBMITTRANSFER,
                state: {
                    confirmed: {
                        pathname: routes.ACCOUNTS_MORE_CREATESCHEDULEDTRANSFER,
                        state: {
                            transaction,
                            account,
                            recipient,
                            initialPage: locations.transferSubmitted,
                        },
                    },
                    cancelled: {
                        pathname: routes.ACCOUNTS_SCHEDULED_TRANSFER,
                        state: {
                            account,
                            amount,
                            recoverState,
                            explicit,
                            recipient,
                        },
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
            <Header> Send funds with a release schedule</Header>
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
                    defaults={defaults}
                    submitSchedule={createTransaction}
                    amount={BigInt(amount)}
                />
            </List>
        </Card>
    );
}
