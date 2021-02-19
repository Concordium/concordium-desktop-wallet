import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { Card, Label, List, Header, Button, Input } from 'semantic-ui-react';
import { LocationDescriptorObject } from 'history';
import routes from '../../constants/routes.json';
import { Account, AddressBookEntry } from '../../utils/types';
import { intervals, Interval } from '../../utils/timeHelpers';
import { displayAsGTU } from '../../utils/gtu';
import {
    createSchedule,
    createScheduledTransferTransaction,
} from '../../utils/transactionHelpers';
import locations from '../../constants/transferLocations.json';

interface State {
    account: Account;
    amount: bigint;
    recipient: AddressBookEntry;
}

interface Props {
    location: LocationDescriptorObject<State>;
}

/**
 * Allows the user to build the schedule of a scheduled transfer.
 */
export default function BuildSchedule({ location }: Props) {
    const dispatch = useDispatch();
    const [releases, setReleases] = useState<number>(1);
    const [chosenInterval, setChosenInterval] = useState<Interval>(
        intervals[0]
    );
    const [startTime, setStartTime] = useState<number>(
        new Date().getTime() + 5 * 60 * 1000 // TODO Decide appropiate default
    );

    if (!location.state) {
        throw new Error('Unexpected missing state.');
    }

    const { account, amount, recipient } = location.state;

    async function createTransaction() {
        const schedule = createSchedule(
            BigInt(amount),
            releases,
            startTime,
            chosenInterval.value
        );
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
                <List.Item>Regular Interval</List.Item>
                <List.Item>
                    Release Every:
                    <Button.Group>
                        {intervals.map((interval: Interval) => (
                            <Button
                                key={interval.label}
                                onClick={() => setChosenInterval(interval)}
                            >
                                {interval.label}
                            </Button>
                        ))}
                    </Button.Group>
                </List.Item>
                <List.Item>
                    <Label>Enter amount of releases</Label>
                    <Input
                        fluid
                        name="name"
                        placeholder="Enter Amount"
                        value={releases}
                        onChange={(e) =>
                            setReleases(parseInt(e.target.value, 10))
                        }
                        autoFocus
                        type="number"
                    />
                </List.Item>
                <List.Item>
                    <Label>Enter starting time:</Label>
                    <Input
                        fluid
                        name="name"
                        placeholder="Enter Starting time"
                        value={startTime}
                        onChange={(e) =>
                            setStartTime(parseInt(e.target.value, 10))
                        }
                        autoFocus
                        type="number"
                    />
                </List.Item>
                <List.Item>
                    <Button onClick={createTransaction}>submit</Button>
                </List.Item>
            </List>
        </Card>
    );
}
