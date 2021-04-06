import React from 'react';
import Form from '~/components/Form';
import { onlyDigitsNoLeadingZeroes } from '~/utils/basicHelpers';
import { UpdateProps } from '~/utils/transactionTypes';
import { EqualRecord } from '~/utils/types';

export interface UpdateBakerStakeThresholdFields {
    threshold: string;
}

const fieldNames: EqualRecord<UpdateBakerStakeThresholdFields> = {
    threshold: 'threshold',
};

/**
 * Component for creating a baker stake threshold update.
 */
export default function UpdateBakerStakeThreshold({
    blockSummary,
}: UpdateProps): JSX.Element | null {
    const currentBakerStakeThreshold =
        blockSummary.updates.chainParameters.minimumThresholdForBaking;

    return (
        <>
            <div>
                <h3>Current baker stake threshold (µGTU)</h3>
                {currentBakerStakeThreshold.toString()}
            </div>
            <Form.Input
                name={fieldNames.threshold}
                label="New baker stake threshold (µGTU)"
                defaultValue={currentBakerStakeThreshold.toString()}
                rules={{
                    required: 'Threshold is required',
                    min: { value: 0, message: 'Must be above 0' },
                    max: {
                        value: 18446744073709551615,
                        message: 'Must be below 18446744073709551615',
                    },
                    validate: (v) =>
                        onlyDigitsNoLeadingZeroes(v) ||
                        'Must be a valid number',
                }}
            />
        </>
    );
}
