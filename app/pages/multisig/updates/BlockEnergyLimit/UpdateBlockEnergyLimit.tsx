import React from 'react';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import Form from '~/components/Form/';
import { mustBeAnInteger, requiredMessage, enterHere } from '../common/util';
import { assertChainParametersV2OrHigher } from '~/utils/blockSummaryHelpers';

export interface BlockEnergyLimitFields {
    blockEnergyLimit: bigint;
}

const fieldNames: EqualRecord<BlockEnergyLimitFields> = {
    blockEnergyLimit: 'blockEnergyLimit',
};

export const fieldDisplays = {
    blockEnergyLimit: 'block energy limit',
};

/**
 * Component for creating an update block energy limit transaction.
 */
export default function BlockEnergyLimit({
    defaults,
    chainParameters,
}: UpdateProps): JSX.Element | null {
    assertChainParametersV2OrHigher(chainParameters);

    const currentBlockEnergyLimit = chainParameters.blockEnergyLimit;

    return (
        <div>
            <div className="body3 mono mB10">
                Current {fieldDisplays.blockEnergyLimit}:{' '}
                {currentBlockEnergyLimit.toString()} NRG
            </div>
            <Form.Input
                className="body2"
                name={fieldNames.blockEnergyLimit}
                defaultValue={
                    defaults.blockEnergyLimit ||
                    currentBlockEnergyLimit.toString()
                }
                label={`New ${fieldDisplays.blockEnergyLimit} (NRG)`}
                placeholder={enterHere(fieldDisplays.blockEnergyLimit)}
                rules={{
                    required: requiredMessage(fieldDisplays.blockEnergyLimit),
                    min: {
                        value: 1,
                        message: 'Block energy limit must be positive',
                    },
                    max: {
                        value: '18446744073709551615',
                        message:
                            'Block energy limit must be below 18446744073709551615',
                    },
                    validate: {
                        mustBeAnInteger,
                    },
                }}
            />
        </div>
    );
}
