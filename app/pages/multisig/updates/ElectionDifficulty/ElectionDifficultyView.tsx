import React from 'react';
import {
    isChainParametersV0,
    isChainParametersV1,
    isConsensusStatusV0,
} from '@concordium/common-sdk/lib/versionedTypeHelpers';
import Loading from '~/cross-app-components/Loading';
import withChainData, { ChainData } from '~/utils/withChainData';
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
    chainParameters,
}: Props) {
    if (!chainParameters || !consensusStatus) {
        return <Loading inline />;
    }

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
