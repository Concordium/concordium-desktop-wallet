import React from 'react';
import { UpdateProps } from '~/utils/transactionTypes';
import ElectionDifficultyInput from './ElectionDifficultyInput';

/**
 * Component for creating an election difficulty update.
 */
export default function UpdateElectionDifficulty({
    defaults,
    blockSummary,
    consensusStatus,
}: UpdateProps): JSX.Element | null {
    const currentElectionDifficulty =
        blockSummary.updates.chainParameters.electionDifficulty;
    const slotDuration = Number(consensusStatus.slotDuration);
    return (
        <div>
            <div className="mono mB10">
                Current election difficulty: {currentElectionDifficulty}
            </div>
            <ElectionDifficultyInput
                label="New election difficulty"
                value={defaults.electionDifficulty || currentElectionDifficulty}
                timePerSlot={slotDuration}
            />
        </div>
    );
}
