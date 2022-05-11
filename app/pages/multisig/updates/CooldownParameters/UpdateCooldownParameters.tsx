import React from 'react';
import { isBlockSummaryV0 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import Form from '~/components/Form/';
import { mustBeAnInteger, requiredMessage, enterHere } from '../common/util';

export interface UpdateCooldownParametersFields {
    poolOwnerCooldown: bigint;
    delegatorCooldown: bigint;
}

const fieldNames: EqualRecord<UpdateCooldownParametersFields> = {
    poolOwnerCooldown: 'poolOwnerCooldown',
    delegatorCooldown: 'delegatorCooldown',
};

export const fieldDisplays = {
    poolOwnerCooldown: 'pool owner cooldown',
    delegatorCooldown: 'delegator cooldown',
};

/**
 * Component for creating an update cooldown parameters transaction.
 */
export default function UpdateCooldownParameters({
    defaults,
    blockSummary,
}: UpdateProps): JSX.Element | null {
    if (isBlockSummaryV0(blockSummary)) {
        throw new Error('Connected node used outdated blockSummary format');
    }

    const currentPoolOwnerCooldown =
        blockSummary.updates.chainParameters.poolOwnerCooldown;
    const currentDelegatorCooldown =
        blockSummary.updates.chainParameters.delegatorCooldown;

    return (
        <div>
            <div className="body3 mono mB10">
                Current {fieldDisplays.poolOwnerCooldown}:{' '}
                {currentPoolOwnerCooldown.toString()} seconds
            </div>
            <Form.Input
                className="body2 mB20"
                name={fieldNames.poolOwnerCooldown}
                defaultValue={
                    defaults.poolOwnerCooldown ||
                    currentPoolOwnerCooldown.toString()
                }
                label={`New ${fieldDisplays.poolOwnerCooldown} (seconds)`}
                placeholder={enterHere(fieldDisplays.poolOwnerCooldown)}
                rules={{
                    required: requiredMessage(fieldDisplays.poolOwnerCooldown),
                    min: {
                        value: 1,
                        message: 'Pool owner cooldown must be positive',
                    },
                    max: {
                        value: '18446744073709551615',
                        message:
                            'Pool owner cooldown must be below 18446744073709551615',
                    },
                    validate: {
                        mustBeAnInteger,
                    },
                }}
            />
            <div className="body3 mono mB10">
                Current {fieldDisplays.delegatorCooldown}:{' '}
                {currentDelegatorCooldown.toString()} seconds
            </div>
            <Form.Input
                className="body2"
                name={fieldNames.delegatorCooldown}
                defaultValue={
                    defaults.delegatorCooldown ||
                    currentDelegatorCooldown.toString()
                }
                label={`New ${fieldDisplays.delegatorCooldown} (seconds)`}
                placeholder={enterHere(fieldDisplays.delegatorCooldown)}
                rules={{
                    required: requiredMessage(fieldDisplays.delegatorCooldown),
                    min: {
                        value: 1,
                        message: 'Delegator cooldown must be positive',
                    },
                    max: {
                        value: '18446744073709551615',
                        message:
                            'Delegator cooldown must be below 18446744073709551615',
                    },
                    validate: {
                        mustBeAnInteger,
                    },
                }}
            />
        </div>
    );
}
