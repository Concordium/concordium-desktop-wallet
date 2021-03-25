import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { Card, List, Header, Button } from 'semantic-ui-react';
import { LocationDescriptorObject } from 'history';
import { stringify } from '../../utils/JSONHelper';
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
import { scheduledTransferCost } from '~/utils/transactionCosts';
import SimpleErrorModal from '~/components/SimpleErrorModal';

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

    const [error, setError] = useState<string | undefined>();
    const [feeCalculator, setFeeCalculator] = useState<
        ((scheduleLength: number) => bigint) | undefined
    >();
    useEffect(() => {
        scheduledTransferCost()
            .then((calculator) => setFeeCalculator(() => calculator))
            .catch((e) =>
                setError(`Unable to get transaction cost due to: ${e}`)
            );
    });
    const { account, amount, recipient, defaults } = location.state;

    async function createTransaction(
        schedule: Schedule,
        estimatedFee: bigint,
        recoverState: unknown
    ) {
        const transaction = await createScheduledTransferTransaction(
            account.address,
            recipient.address,
            schedule
        );
        transaction.estimatedFee = estimatedFee;
        const transactionJSON = stringify(transaction);
        dispatch(
            push({
                pathname: routes.SUBMITTRANSFER,
                state: {
                    confirmed: {
                        pathname: routes.ACCOUNTS_MORE_CREATESCHEDULEDTRANSFER,
                        state: {
                            transaction: transactionJSON,
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
                            defaults: recoverState,
                            explicit,
                            recipient,
                        },
                    },
                    transaction: transactionJSON,
                    account,
                },
            })
        );
    }

    const BuildComponent = explicit ? ExplicitSchedule : RegularInterval;

    if (!feeCalculator) {
        return (
            <>
                <SimpleErrorModal
                    show={Boolean(error)}
                    content={error}
                    onClick={() => dispatch(push(routes.ACCOUNTS))}
                />
            </>
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
                    feeCalculator={feeCalculator}
                />
            </List>
        </Card>
    );
}
