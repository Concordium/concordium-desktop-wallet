import React, { forwardRef, useState } from 'react';
import clsx from 'clsx';
import { toMicroUnits } from '~/utils/gtu';
import { Schedule } from '~/utils/types';
import RegularInterval from '~/components/BuildSchedule/BuildRegularInterval';
import ExplicitSchedule from '~/components/BuildSchedule/BuildExplicitSchedule';
import ButtonGroup from '~/components/ButtonGroup';
import {
    ScheduledTransferBuilderRef,
    BuildScheduleDefaults,
} from '~/components/BuildSchedule/util';
import accountStyles from '~/pages/Accounts/Accounts.module.scss';
import styles from './MultisignatureAccountTransactions.module.scss';

interface Props {
    submitSchedule: (
        schedule: Schedule,
        defaults: BuildScheduleDefaults
    ) => void;
    amount: string;
    setReady(isReady: boolean): void;
    defaults?: BuildScheduleDefaults;
}

// TODO: Add Estimated Fee connection
/**
 * Allows the user to build the schedule of a scheduled transfer.
 */
const BuildSchedule = forwardRef<ScheduledTransferBuilderRef, Props>(
    ({ amount, submitSchedule, setReady, defaults }, ref) => {
        const [explicit, setExplicit] = useState<boolean>(
            defaults?.explicit || false
        );

        const BuildComponent = explicit ? ExplicitSchedule : RegularInterval;

        return (
            <div
                className={clsx(
                    accountStyles.buildSchedule,
                    styles.buildSchedule
                )}
            >
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
                <BuildComponent
                    defaults={defaults}
                    submitSchedule={submitSchedule}
                    setScheduleLength={() => {}}
                    amount={toMicroUnits(amount)}
                    hideSubmitButton
                    ref={ref}
                    onValidChange={setReady}
                />
            </div>
        );
    }
);

BuildSchedule.displayName = 'BuildSchedule';

export default BuildSchedule;
