import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { List, Header, Button, Input } from 'semantic-ui-react';
import { LocationDescriptorObject } from 'history';
import routes from '../../constants/routes.json';
import { Account, AddressBookEntry } from '../../utils/types';
import {
    createSchedule,
    createScheduledTransferTransaction,
} from '../../utils/transactionHelpers';

interface State {
    account: Account;
    amount: bigint;
    recipient: AddressBookEntry;
}

interface Props {
    location: LocationDescriptorObject<State>;
}

const minute = 60000;

/**
 * Receives transaction to sign, using the ledger,
 * and then submits it.
 */
export default function SubmitTransfer({ location }: Props) {
    const dispatch = useDispatch();
    const [releases, setReleases] = useState<number>(1); // This is a string, to allows user input in GTU

    if (!location.state) {
        throw new Error('Unexpected missing state.');
    }

    const { account, amount, recipient } = location.state;

    async function createTransaction() {
        const schedule = createSchedule(
            BigInt(amount),
            releases,
            new Date().getTime() + 5 * minute,
            minute
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
                        routes.ACCOUNTS_SIMPLETRANSFER_TRANSFERSUBMITTED,
                    transaction,
                    account,
                    recipient,
                },
            })
        );
    }

    return (
        <>
            <List>
                <List.Item>
                    <Header textAlign="center">
                        Send funds {amount} to {recipient.name}
                    </Header>
                </List.Item>
                <List.Item>Regular Interval</List.Item>
                <List.Item>
                    Release Every:
                    <Button.Group>
                        <Button>Second</Button>
                        <Button>Minute</Button>
                        <Button>Hour</Button>
                    </Button.Group>
                </List.Item>
                <List.Item>
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
                <List.Item>Starting: 5 minutes from now</List.Item>
                <List.Item>
                    <Button onClick={createTransaction} />
                </List.Item>
            </List>
        </>
    );
}
