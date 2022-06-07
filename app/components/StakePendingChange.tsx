import React from 'react';
import type { StakePendingChange as PendingChange } from '@concordium/node-sdk';
import { isRemovalPendingChange } from '@concordium/node-sdk/lib/src/accountHelpers';
import { useLastFinalizedBlockSummary } from '~/utils/dataHooks';
import { displayAsCcd } from '~/utils/ccd';
import {
    dateFromStakePendingChange,
    getFormattedDateString,
} from '~/utils/timeHelpers';
import { useAsyncMemo } from '~/utils/hooks';
import { getRewardStatus } from '~/node/nodeRequests';
import { noOp } from '~/utils/basicHelpers';

interface Props {
    pending: PendingChange;
}

/** Render a bakers pending change */
export default function StakePendingChange({ pending }: Props) {
    const { consensusStatus: cs, lastFinalizedBlockSummary: bs } =
        useLastFinalizedBlockSummary() ?? {};
    const rs = useAsyncMemo(
        async () =>
            cs !== undefined
                ? getRewardStatus(cs.lastFinalizedBlock)
                : undefined,
        noOp,
        [cs]
    );

    if (cs === undefined || rs === undefined || bs === undefined) {
        return null;
    }

    const changeAtDate = dateFromStakePendingChange(
        pending,
        cs,
        rs,
        bs.updates.chainParameters
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
