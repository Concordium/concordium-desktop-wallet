import React, { useEffect, useState } from 'react';
import Input from '../../components/Form/Input';
import { createUpdateMultiSignatureTransaction } from '../../utils/MultiSignatureTransactionHelper';
import { UpdateProps } from '../../utils/transactionTypes';
import { UpdateType } from '../../utils/types';

/**
 * Component for creating an election difficulty update.
 */
export default function UpdateElectionDifficulty({
    blockSummary,
    effectiveTime,
    setProposal,
}: UpdateProps): JSX.Element | null {
    const [error, setError] = useState<string | undefined>();

    const currentElectionDifficulty =
        blockSummary.updates.chainParameters.electionDifficulty;
    const sequenceNumber =
        blockSummary.updates.updateQueues.foundationAccount.nextSequenceNumber;
    const {
        threshold,
    } = blockSummary.updates.authorizations.electionDifficulty;

    const [
        electionDifficultyInput,
        setElectionDifficultyInput,
    ] = useState<string>((currentElectionDifficulty * 100000).toString());

    useEffect(() => {
        if (!error) {
            setProposal(
                createUpdateMultiSignatureTransaction(
                    {
                        electionDifficulty: parseInt(
                            electionDifficultyInput,
                            10
                        ),
                    },
                    UpdateType.UpdateElectionDifficulty,
                    sequenceNumber,
                    threshold,
                    effectiveTime
                )
            );
        }
    }, [
        electionDifficultyInput,
        sequenceNumber,
        threshold,
        setProposal,
        effectiveTime,
        error,
    ]);

    return (
        <>
            <h3>Current election difficulty</h3>
            <Input readOnly value={currentElectionDifficulty} />
            <h3>New election difficulty (/100000)</h3>
            <Input
                value={electionDifficultyInput}
                onChange={(e) => {
                    const input = e.target.value;
                    setElectionDifficultyInput(input);
                    try {
                        const electionDifficulty = parseInt(input, 10);
                        if (
                            !electionDifficulty ||
                            electionDifficulty > 100000 ||
                            electionDifficulty < 0 ||
                            Number.isNaN(electionDifficulty)
                        ) {
                            setError(
                                'The input was invalid. Provide an integer between 0 and 100000'
                            );
                        } else {
                            setError(undefined);
                        }
                    } catch (err) {
                        setError(
                            'The input was invalid. Provide an integer between 0 and 100000'
                        );
                    }
                }}
                error={error}
            />
        </>
    );
}
