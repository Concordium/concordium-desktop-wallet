import { StakePendingChange } from '@concordium/node-sdk';
import { isReduceStakePendingChange } from '@concordium/node-sdk/lib/src/accountHelpers';
import React, { PropsWithChildren } from 'react';
import Label from '~/components/Label';
import Card from '~/cross-app-components/Card';
import { displayAsCcd } from '~/utils/ccd';
import { useConsensusStatus } from '~/utils/dataHooks';
import {
    dateFromStakePendingChange,
    getFormattedDateString,
} from '~/utils/timeHelpers';

import styles from './StakingDetails.module.scss';

interface ValueProps {
    title: string;
    value: string | JSX.Element;
}

function Value({ title, value }: ValueProps) {
    return (
        <div className="mB20">
            <Label className="mB5 textWhite">{title}:</Label>
            <span className="body2">{value}</span>
        </div>
    );
}

type StakingType = 'baker' | 'delegator';

const reduceTitles: { [k in StakingType]: string } = {
    baker: 'New baker stake',
    delegator: 'New delegation amount',
};
const removeTitles: { [k in StakingType]: string } = {
    baker:
        'Baking will be stopped, and the staked amount will be unlocked on the public balance of the account.',
    delegator:
        'The delegation will be stopped, and the delegation amount will be unlocked on the public balance of the account.',
};

type Props = PropsWithChildren<{
    title: string;
    pending: StakePendingChange | undefined;
    type: StakingType;
}>;

export default function StakingDetails({
    children,
    title,
    pending,
    type,
}: Props) {
    const cs = useConsensusStatus(true);
    const pendingChangeDate =
        pending !== undefined
            ? dateFromStakePendingChange(pending, cs)
            : undefined;

    return (
        <Card className={styles.root} dark>
            <header className={styles.header}>
                <h2 className="mB0">{title}</h2>
            </header>
            {children}
            {pending !== undefined && pendingChangeDate !== undefined && (
                <div className="mT50">
                    <div className="textWhite mB20">
                        The following changes will take effect on
                        <br />
                        {getFormattedDateString(pendingChangeDate)}
                    </div>
                    {isReduceStakePendingChange(pending) ? (
                        <Value
                            title={reduceTitles[type]}
                            value={displayAsCcd(pending.newStake)}
                        />
                    ) : (
                        <span className="mB20">{removeTitles[type]}</span>
                    )}
                </div>
            )}
        </Card>
    );
}

StakingDetails.Value = Value;
