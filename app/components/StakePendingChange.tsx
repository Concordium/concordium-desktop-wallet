import React from 'react';
import type { StakePendingChange as PendingChange } from '@concordium/node-sdk';
import {
    isRemovalPendingChange,
    isStakePendingChangeV1,
} from '@concordium/node-sdk/lib/src/accountHelpers';
import { useConsensusStatus } from '~/utils/dataHooks';
import { displayAsCcd } from '~/utils/ccd';
import { epochDate, getFormattedDateString } from '~/utils/timeHelpers';

interface Props {
    pending: PendingChange;
}

/** Render a bakers pending change */
export default function StakePendingChange({ pending }: Props) {
    const status = useConsensusStatus();

    if (status === undefined) {
        return null;
    }

    const changeAtDate = isStakePendingChangeV1(pending)
        ? pending.effectiveTime
        : epochDate(
              Number(pending.epoch),
              status.epochDuration,
              new Date(status.currentEraGenesisTime)
          );
    const formattedDate = getFormattedDateString(changeAtDate);

    return isRemovalPendingChange(pending) ? (
        <>
            Stake is being removed on
            <br />
            {formattedDate}
        </>
    ) : (
        <>
            Stake is set to be reduced to {displayAsCcd(pending.newStake)} on
            <br />
            {formattedDate}
        </>
    );
}
