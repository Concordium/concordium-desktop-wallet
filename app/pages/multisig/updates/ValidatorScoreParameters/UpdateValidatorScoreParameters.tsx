import React from 'react';
import { EqualRecord, isMinChainParametersV3 } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import Form from '~/components/Form/';
import { mustBeAnInteger, requiredMessage, enterHere } from '../common/util';

export interface UpdateValidatorScoreParametersFields {
    maxMissedRounds: bigint;
}

const fieldNames: EqualRecord<UpdateValidatorScoreParametersFields> = {
    maxMissedRounds: 'maxMissedRounds',
};

export const fieldDisplays = {
    maxMissedRounds: 'max missed rounds',
};

/**
 * Component for creating an update validator score parameters transaction.
 */
export default function UpdateValidatorScoreParameters({
    defaults,
    chainParameters,
}: UpdateProps): JSX.Element | null {
    if (!isMinChainParametersV3(chainParameters)) {
        throw new Error('Connected node used outdated chainParameters format');
    }

    const { maxMissedRounds } = chainParameters.validatorScoreParameters;

    return (
        <div>
            <div className="body3 mono mB10">
                Current {fieldDisplays.maxMissedRounds}:{' '}
                {maxMissedRounds.toString()} rounds
            </div>
            <Form.Input
                className="body2 mB20"
                name={fieldNames.maxMissedRounds}
                defaultValue={
                    defaults.maxMissedRounds || maxMissedRounds.toString()
                }
                label={`New ${fieldDisplays.maxMissedRounds}`}
                placeholder={enterHere(fieldDisplays.maxMissedRounds)}
                rules={{
                    required: requiredMessage(fieldDisplays.maxMissedRounds),
                    min: {
                        value: 1,
                        message: 'Value must be positive',
                    },
                    validate: {
                        mustBeAnInteger,
                    },
                }}
            />
        </div>
    );
}
