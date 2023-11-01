import React from 'react';
import Form from '~/components/Form';
import { onlyDigitsNoLeadingZeroes } from '~/utils/basicHelpers';
import { getMinimumStakeForBaking } from '~/utils/blockSummaryHelpers';
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
    chainParameters,
}: UpdateProps): JSX.Element | null {
    const currentBakerStakeThreshold = getMinimumStakeForBaking(
        chainParameters
    );

    return (
        <div>
            <div className="body3 mono mB10">
                Current threshold (µCCD):{' '}
                {currentBakerStakeThreshold.toString()}
            </div>
            <Form.Input
                className="body2"
                name={fieldNames.threshold}
                label="New validator stake threshold (µCCD)"
                defaultValue={currentBakerStakeThreshold.toString()}
                rules={{
                    required: 'Threshold is required',
                    min: { value: 0, message: 'Must be above 0' },
                    max: {
                        value: '18446744073709551615',
                        message: 'Must be below 18446744073709551615',
                    },
                    validate: (v) =>
                        onlyDigitsNoLeadingZeroes(v) ||
                        'Must be a valid number',
                }}
            />
        </div>
    );
}
