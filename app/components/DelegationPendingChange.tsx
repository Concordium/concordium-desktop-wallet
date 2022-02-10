import React from 'react';
import { useConsensusStatus } from '~/utils/dataHooks';
import { displayAsGTU } from '~/utils/gtu';
import { epochDate, getFormattedDateString } from '~/utils/timeHelpers';

type Props = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pending: any; // TODO #delegation change to actual model.
};

export default function PendingChange({ pending }: Props) {
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

    return pending.change === 'RemoveDelegation' ? (
        <>
            Delegated amount is withdrawn on
            <br />
            {changeAtDate}
        </>
    ) : (
        <>
            Delegated amount is set to be reduced to{' '}
            {displayAsGTU(pending.newStake)} on
            <br />
            {changeAtDate}
        </>
    );
}
