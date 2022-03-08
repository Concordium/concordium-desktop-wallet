import React from 'react';
import { isBlockSummaryV1 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import Input from '~/components/Form/Input/';
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
    poolOwnerCooldown: 'Pool owner cooldown',
    delegatorCooldown: 'Delegator cooldown',
};

/**
 * Component for creating an update cooldown parameters transaction.
 */
export default function UpdateCooldownParameters({
    defaults,
    blockSummary,
}: UpdateProps): JSX.Element | null {
    if (!isBlockSummaryV1(blockSummary)) {
        throw new Error('Connected node used outdated blockSummary format');
    }

    const currentPoolOwnerCooldown =
        blockSummary.updates.chainParameters.poolOwnerCooldown;
    const currentDelegatorCooldown =
        blockSummary.updates.chainParameters.delegatorCooldown;

    return (
        <>
            <div>
                <Input
                    className="body2 mB20"
                    value={currentPoolOwnerCooldown.toString()}
                    label={`Current ${fieldDisplays.poolOwnerCooldown} (seconds)`}
                    disabled
                />
                <Input
                    className="body2"
                    value={currentDelegatorCooldown.toString()}
                    label={`Current ${fieldDisplays.delegatorCooldown} (seconds)`}
                    disabled
                />
            </div>
            <div>
                <Form.Input
                    className="body2 mB20"
                    name={fieldNames.poolOwnerCooldown}
                    defaultValue={
                        defaults.poolOwnerCooldown ||
                        currentPoolOwnerCooldown.toString()
                    }
                    label="New pool owner cooldown (seconds)"
                    placeholder={enterHere(fieldDisplays.poolOwnerCooldown)}
                    rules={{
                        required: requiredMessage(
                            fieldDisplays.poolOwnerCooldown
                        ),
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
                <Form.Input
                    className="body2"
                    name={fieldNames.delegatorCooldown}
                    defaultValue={
                        defaults.delegatorCooldown ||
                        currentDelegatorCooldown.toString()
                    }
                    label="New pool owner cooldown (seconds)"
                    placeholder={enterHere(fieldDisplays.delegatorCooldown)}
                    rules={{
                        required: requiredMessage(
                            fieldDisplays.delegatorCooldown
                        ),
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
        </>
    );
}
