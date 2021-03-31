import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { LocationDescriptorObject } from 'history';
import { stringify } from '~/utils/JSONHelper';
import routes from '~/constants/routes.json';
import { Account, AddressBookEntry, Schedule } from '~/utils/types';
import { displayAsGTU, toGTUString } from '~/utils/gtu';
import { createScheduledTransferTransaction } from '~/utils/transactionHelpers';
import locations from '~/constants/transferLocations.json';
import RegularInterval, {
    Defaults as RegularIntervalDefaults,
} from './BuildRegularInterval';
import ExplicitSchedule, {
    Defaults as ExplicitScheduleDefaults,
} from './BuildExplicitSchedule';
import TransferView from '~/components/Transfers/TransferView';
import styles from './Accounts.module.scss';
import ButtonGroup from '~/components/ButtonGroup';

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

    return (
        <TransferView
            className={styles.buildSchedule}
            showBack
            exitOnClick={() => dispatch(push(routes.ACCOUNTS))}
            backOnClick={() =>
                dispatch(
                    push({
                        pathname: routes.ACCOUNTS_MORE_CREATESCHEDULEDTRANSFER,
                        state: { amount: toGTUString(amount), recipient },
                    })
                )
            }
        >
            <div className={styles.buildScheduleCommon}>
                <h2> Send fund with a release schedule </h2>
                <h2>
                    {displayAsGTU(amount)} to {recipient.name}
                </h2>
                <ButtonGroup
                    buttons={[
                        { label: 'Regular Interval', value: false },
                        { label: 'Explicit Schedule', value: true },
                    ]}
                    isSelected={({ value }) => value === explicit}
                    onClick={({ value }) => setExplicit(value)}
                    name="scheduleType"
                    title="Schedule type:"
                />
            </div>
            <div className={styles.buildComponent}>
                <BuildComponent
                    defaults={defaults}
                    submitSchedule={createTransaction}
                    amount={BigInt(amount)}
                />
            </div>
        </TransferView>
    );
}
