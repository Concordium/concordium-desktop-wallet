import React from 'react';
import type { StakePendingChange as PendingChange } from '@concordium/web-sdk';
import { StakePendingChangeType } from '@concordium/web-sdk';
import { useBlockChainParameters, useConsensusStatus } from '~/utils/dataHooks';
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
    const cs = useConsensusStatus();
    const chainParameters = useBlockChainParameters();
    const rs = useAsyncMemo(
        async () =>
            cs !== undefined
                ? getRewardStatus(cs.lastFinalizedBlock.toString())
                : undefined,
        noOp,
        [cs]
    );

    if (cs === undefined || rs === undefined || chainParameters === undefined) {
        return null;
    }

    const changeAtDate = dateFromStakePendingChange(
        pending,
        cs,
        rs,
        chainParameters
    );
    const formattedDate = getFormattedDateString(changeAtDate);

    return pending.change === StakePendingChangeType.RemoveStake ? (
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
