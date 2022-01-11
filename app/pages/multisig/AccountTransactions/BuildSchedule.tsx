import React, { forwardRef, useState } from 'react';
import clsx from 'clsx';
import { toMicroUnits } from '~/utils/gtu';
import { Schedule } from '~/utils/types';
import RegularInterval from '~/components/BuildSchedule/BuildRegularInterval';
import ExplicitSchedule from '~/components/BuildSchedule/BuildExplicitSchedule';
import {
    ScheduledTransferBuilderRef,
    BuildScheduleDefaults,
} from '~/components/BuildSchedule/util';
import Radios from '~/components/Form/Radios';

import accountStyles from '~/pages/Accounts/AccountDetailsPage/BuildSchedule/BuildSchedule.module.scss';

interface Props {
    submitSchedule: (
        schedule: Schedule,
        defaults: BuildScheduleDefaults
    ) => void;
    setScheduleLength: (scheduleLength: number) => void;
    amount: string;
    defaults?: BuildScheduleDefaults;
}

/**
 * Allows the user to build the schedule of a scheduled transfer.
 */
const BuildSchedule = forwardRef<ScheduledTransferBuilderRef, Props>(
    ({ amount, submitSchedule, setScheduleLength, defaults }, ref) => {
        const [explicit, setExplicit] = useState<boolean>(
            defaults?.explicit || false
        );

        const BuildComponent = explicit ? ExplicitSchedule : RegularInterval;

        return (
            <div
                className={clsx(
                    accountStyles.buildSchedule,
                    'flexColumn flexChildFill'
                )}
            >
                <Radios
                    options={[
                        { label: 'Regular interval', value: false },
                        { label: 'Explicit schedule', value: true },
                    ]}
                    value={explicit}
                    onChange={setExplicit}
                    label="Schedule type:"
                />
                <BuildComponent
                    defaults={defaults}
                    submitSchedule={submitSchedule}
                    setScheduleLength={setScheduleLength}
                    amount={toMicroUnits(amount)}
                    ref={ref}
                />
            </div>
        );
    }
);

BuildSchedule.displayName = 'BuildSchedule';

export default BuildSchedule;
