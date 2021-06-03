import React from 'react';
import { displayAsGTU } from '~/utils/gtu';
import { epochDate, getFormattedDateString } from '~/utils/timeHelpers';
import { BakerPendingChange } from '~/utils/types';

type PendingChangeProps = {
    pending: BakerPendingChange;
    epochDuration: number;
    genesisTime: Date;
};

/** Render a bakers pending change */
export default function PendingChange({
    pending,
    epochDuration,
    genesisTime,
}: PendingChangeProps) {
    const changeAtDate = getFormattedDateString(
        epochDate(pending.epoch, epochDuration, genesisTime)
    );

    return pending.change === 'RemoveBaker' ? (
        <i>Removing baker at {changeAtDate}</i>
    ) : (
        <i>
            Reducing stake to {displayAsGTU(pending.newStake)} at {changeAtDate}
        </i>
    );
}
