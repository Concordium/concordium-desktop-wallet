import React, { useState } from 'react';
import { List } from 'semantic-ui-react';
import { toMicroUnits } from '~/utils/gtu';
import { Schedule } from '~/utils/types';
import RegularInterval from '~/pages/Accounts/BuildRegularInterval';
import ExplicitSchedule from '~/pages/Accounts/BuildExplicitSchedule';
import Button from '~/cross-app-components/Button';

interface Props {
    submitSchedule: (schedule: Schedule) => void;
    amount: string;
}

/**
 * Allows the user to build the schedule of a scheduled transfer.
 */
export default function BuildSchedule({ amount, submitSchedule }: Props) {
    const [explicit, setExplicit] = useState<boolean>(false);

    const BuildComponent = explicit ? ExplicitSchedule : RegularInterval;

    return (
        <List>
            <List.Item />
            <List.Item>
                <Button onClick={() => setExplicit(false)} disabled={!explicit}>
                    Regular Interval
                </Button>
                <Button onClick={() => setExplicit(true)} disabled={explicit}>
                    Explicit schedule
                </Button>
            </List.Item>

            <BuildComponent
                submitSchedule={submitSchedule}
                amount={toMicroUnits(amount)}
            />
        </List>
    );
}
