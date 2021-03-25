import React from 'react';
import { Validate } from 'react-hook-form';
import Form from '~/components/Form';
import { onlyDigitsNoLeadingZeroes } from '~/utils/basicHelpers';
import { UpdateProps } from '../../utils/transactionTypes';
import { EqualRecord } from '../../utils/types';

export interface UpdateElectionDifficultyFields {
    electionDifficulty: string;
}

const fieldNames: EqualRecord<UpdateElectionDifficultyFields> = {
    electionDifficulty: 'electionDifficulty',
};

const validateOnlyDigits: Validate = (value: string) =>
    onlyDigitsNoLeadingZeroes(value) || 'Value must be an integer';

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
                    validate: validateOnlyDigits,
                }}
            />
        </>
    );
}
