import React from 'react';
import { UpdateProps } from '~/utils/transactionTypes';
import ElectionDifficultyInput from './ElectionDifficultyInput';

/**
 * Component for creating an election difficulty update.
 */
export default function UpdateElectionDifficulty({
    blockSummary,
    consensusStatus,
}: UpdateProps): JSX.Element | null {
    const currentElectionDifficulty =
        blockSummary.updates.chainParameters.electionDifficulty;
    const { slotDuration } = consensusStatus;
    return (
        <>
            <ElectionDifficultyInput
                label="Current election difficulty"
                disabled
                value={currentElectionDifficulty}
                timePerSlot={slotDuration}
            />
            <ElectionDifficultyInput
                label="New election difficulty"
                value={currentElectionDifficulty}
                timePerSlot={slotDuration}
            />
        </>
    );
}
