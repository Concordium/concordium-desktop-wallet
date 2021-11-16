import React from 'react';
import type { BakerPendingChange } from '@concordium/node-sdk';
import { useConsensusStatus } from '~/utils/dataHooks';
import { displayAsGTU } from '~/utils/gtu';
import { epochDate, getFormattedDateString } from '~/utils/timeHelpers';

type PendingChangeProps = {
    pending: BakerPendingChange;
};

/** Render a bakers pending change */
export default function PendingChange({ pending }: PendingChangeProps) {
    const status = useConsensusStatus();
    if (status === undefined) {
        return null;
    }
    const changeAtDate = getFormattedDateString(
        epochDate(
            Number(pending.epoch),
            status.epochDuration,
            new Date(status.currentEraGenesisTime)
        )
    );

    return pending.change === 'RemoveBaker' ? (
        <>
            Baker is being removed on
            <br />
            {changeAtDate}
        </>
    ) : (
        <>
            Stake is set to be reduced to {displayAsGTU(pending.newStake)} on
            <br />
            {changeAtDate}
        </>
    );
}
