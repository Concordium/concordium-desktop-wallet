import { StakePendingChange } from '@concordium/node-sdk';
import { isReduceStakePendingChange } from '@concordium/node-sdk/lib/src/accountHelpers';
import React, { PropsWithChildren } from 'react';
import Label from '~/components/Label';
import Card from '~/cross-app-components/Card';
import { displayAsCcd } from '~/utils/ccd';

import styles from './StakingDetails.module.scss';

interface ValueProps {
    title: string;
    value: string | JSX.Element;
}

function Value({ title, value }: ValueProps) {
    return (
        <div className="mB30:notLast">
            <Label className="mB5">{title}</Label>
            {value}
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
    return (
        <Card className={styles.root} dark>
            <header className={styles.header}>
                <h3 className="mB0">{title}</h3>
            </header>
            {children}
            {pending !== undefined && (
                <>
                    {isReduceStakePendingChange(pending) ? (
                        <Value
                            title={reduceTitles[type]}
                            value={displayAsCcd(pending.newStake)}
                        />
                    ) : (
                        <span>{removeTitles[type]}</span>
                    )}
                </>
            )}
        </Card>
    );
}

StakingDetails.Value = Value;
