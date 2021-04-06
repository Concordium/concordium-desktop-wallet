import React, { useState } from 'react';
import { toMicroUnits } from '~/utils/gtu';
import { Schedule } from '~/utils/types';
import RegularInterval from '~/pages/Accounts/BuildRegularInterval';
import ExplicitSchedule from '~/pages/Accounts/BuildExplicitSchedule';
import ButtonGroup from '~/pages/Accounts/ButtonGroup';
import styles from './MultisignatureAccountTransactions.module.scss';

interface Props {
    submitSchedule: (schedule: Schedule) => void;
    amount: string;
}

/**
 * Allows the user to build the schedule of a scheduled transfer.
   TODO: Add Estimated Fee connection
 */
export default function BuildSchedule({ amount, submitSchedule }: Props) {
    const [explicit, setExplicit] = useState<boolean>(false);

    const BuildComponent = explicit ? ExplicitSchedule : RegularInterval;

    return (
        <>
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
            <div className={styles.buildComponent}>
                <BuildComponent
                    submitSchedule={submitSchedule}
                    setScheduleLength={() => {}}
                    amount={toMicroUnits(amount)}
                />
            </div>
        </>
    );
}
