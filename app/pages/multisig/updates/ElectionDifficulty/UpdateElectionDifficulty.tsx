import {
    isChainParametersV0,
    isChainParametersV1,
    isConsensusStatusV0,
} from '@concordium/common-sdk/lib/versionedTypeHelpers';
import React from 'react';
import { UpdateProps } from '~/utils/transactionTypes';
import ElectionDifficultyInput from './ElectionDifficultyInput';

/**
 * Component for creating an election difficulty update.
 */
export default function UpdateElectionDifficulty({
    defaults,
    chainParameters,
    consensusStatus,
}: UpdateProps): JSX.Element | null {
    if (
        (!isChainParametersV0(chainParameters) &&
            !isChainParametersV1(chainParameters)) ||
        !isConsensusStatusV0(consensusStatus)
    ) {
        throw new Error(
            'election difficulty only available on Protocol versions < 6'
        );
    }

    const currentElectionDifficulty = chainParameters.electionDifficulty;
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
