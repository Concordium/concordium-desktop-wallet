import React from 'react';
import Loading from '~/cross-app-components/Loading';
import withChainData, { ChainData } from '../../common/withChainData';
import ElectionDifficultyInput from './ElectionDifficultyInput';
import { electionDifficultyResolution } from './util';

interface Props extends ChainData {
    electionDifficulty: number;
}

/**
 * Displays an overview of an election difficulty transaction payload.
 */
export default withChainData(function ElectionDifficultyView({
    electionDifficulty,
    consensusStatus,
    blockSummary,
}: Props) {
    if (!blockSummary || !consensusStatus) {
        return <Loading inline />;
    }

    const currentElectionDifficulty =
        blockSummary.updates.chainParameters.electionDifficulty;
    const slotDuration = Number(consensusStatus.slotDuration);

    return (
        <>
            <ElectionDifficultyInput
                label="Current election difficulty:"
                display
                value={currentElectionDifficulty}
                timePerSlot={slotDuration}
            />
            <ElectionDifficultyInput
                label="New election difficulty:"
                display
                value={electionDifficulty / electionDifficultyResolution}
                timePerSlot={slotDuration}
            />
        </>
    );
});
