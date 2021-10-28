import React from 'react';
import { useConsensusStatus } from '~/utils/dataHooks';
import { displayAsGTU } from '~/utils/gtu';
import { epochDate, getFormattedDateString } from '~/utils/timeHelpers';
import { BakerPendingChange } from '~/utils/types';

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
            pending.epoch,
            status.epochDuration,
            new Date(status.currentEraGenesisTime)
        )
    );

    return pending.change === 'RemoveBaker' ? (
        <>Baker is being removed {changeAtDate}</>
    ) : (
        <>
            Stake is set to be reduced to {displayAsGTU(pending.newStake)} at{' '}
            {changeAtDate}
        </>
    );
}
