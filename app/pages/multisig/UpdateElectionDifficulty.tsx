import React, { useEffect, useState } from 'react';
import { onlyDigitsNoLeadingZeroes } from '~/utils/basicHelpers';
import Input from '../../components/Form/Input';
import { createUpdateMultiSignatureTransaction } from '../../utils/MultiSignatureTransactionHelper';
import { UpdateProps } from '../../utils/transactionTypes';
import { UpdateType } from '../../utils/types';

const errorText =
    'The input was invalid. Provide an integer between 0 and 100000';

/**
 * Component for creating an election difficulty update.
 */
export default function UpdateElectionDifficulty({
    blockSummary,
    effectiveTime,
    setProposal,
    setDisabled,
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

    /**
     * Update the election difficulty based on the input given. If the input
     * is invalid, then set an error state with a description of the bad input.
     */
    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const input = e.target.value;
        setElectionDifficultyInput(input);

        if (!onlyDigitsNoLeadingZeroes(input)) {
            setError(errorText);
            return;
        }

        const electionDifficulty = parseInt(input, 10);
        if (electionDifficulty > 100000 || electionDifficulty < 0) {
            setError(errorText);
        } else {
            setError(undefined);
        }
    }

    useEffect(() => {
        if (error) {
            setDisabled(true);
        }

        if (!error && effectiveTime) {
            setDisabled(false);
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
        setDisabled,
    ]);

    return (
        <>
            <h3>Current election difficulty</h3>
            <Input readOnly value={currentElectionDifficulty} />
            <h3>New election difficulty (/100000)</h3>
            <Input
                value={electionDifficultyInput}
                onChange={onInputChange}
                error={error}
            />
        </>
    );
}
