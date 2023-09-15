import React from 'react';
import { isChainParametersV0, isChainParametersV1 } from '@concordium/web-sdk';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import Form from '~/components/Form/';
import { enterHere, validationRulesForPositiveWord64 } from '../common/util';

export interface MinBlockTimeFields {
    minBlockTime: bigint;
}

const fieldNames: EqualRecord<MinBlockTimeFields> = {
    minBlockTime: 'minBlockTime',
};

export const fieldDisplays = {
    minBlockTime: 'minimum block time',
};

/**
 * Component for creating an update minimum block time transaction.
 */
export default function MinBlockTime({
    defaults,
    chainParameters,
}: UpdateProps): JSX.Element | null {
    if (
        isChainParametersV0(chainParameters) ||
        isChainParametersV1(chainParameters)
    ) {
        throw new Error('Connected node used outdated chainParameters format');
    }

    const currentMinBlockTime = chainParameters.minBlockTime;

    return (
        <div>
            <div className="body3 mono mB10">
                Current {fieldDisplays.minBlockTime}:{' '}
                {currentMinBlockTime.toString()} ms
            </div>
            <Form.Input
                className="body2"
                name={fieldNames.minBlockTime}
                defaultValue={
                    defaults.minBlockTime || currentMinBlockTime.toString()
                }
                label={`New ${fieldDisplays.minBlockTime} (ms)`}
                placeholder={enterHere(fieldDisplays.minBlockTime)}
                rules={validationRulesForPositiveWord64(
                    fieldDisplays.minBlockTime
                )}
            />
        </div>
    );
}
