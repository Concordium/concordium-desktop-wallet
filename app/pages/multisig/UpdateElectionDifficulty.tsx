import React from 'react';
import { ValidateResult } from 'react-hook-form';
import Form from '~/components/Form';
import { UpdateProps } from '../../utils/transactionTypes';
import { EqualRecord } from '../../utils/types';

export interface UpdateElectionDifficultyFields {
    electionDifficulty: string;
}

const fieldNames: EqualRecord<UpdateElectionDifficultyFields> = {
    electionDifficulty: 'electionDifficulty',
};

/**
 * Determines whether or not the input string consists of only digits,
 * with no leading zero (except if only a single digit).
 */
function onlyDigitsNoLeadingZeroes(value: string): ValidateResult {
    return /^(?:[1-9][0-9]*|0)$/.test(value) || 'Value must be an integer';
}

const resolution = 100000;

/**
 * Component for creating an election difficulty update.
 */
export default function UpdateElectionDifficulty({
    blockSummary,
}: UpdateProps): JSX.Element | null {
    const currentElectionDifficulty =
        blockSummary.updates.chainParameters.electionDifficulty;

    return (
        <>
            <h3>Current election difficulty</h3>
            <span className="textFaded">{currentElectionDifficulty}</span>
            <Form.Input
                name={fieldNames.electionDifficulty}
                label="New election difficulty (/100000)"
                placeholder="Enter new election difficulty"
                defaultValue={currentElectionDifficulty * resolution}
                rules={{
                    min: { value: 0, message: 'Value must be above 0' },
                    max: {
                        value: resolution,
                        message: `Value must be below ${resolution}`,
                    },
                    required: 'Value must be provided',
                    validate: {
                        onlyDigitsNoLeadingZeroes,
                    },
                }}
            />
        </>
    );
}
