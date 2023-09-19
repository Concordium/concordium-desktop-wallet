import React from 'react';
import { isChainParametersV0, isChainParametersV1 } from '@concordium/web-sdk';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import Form from '~/components/Form/';
import { mustBeAnInteger, requiredMessage, enterHere } from '../common/util';
import {
    FinalizationCommitteeParametersFields,
    fieldDisplays,
    getCurrentFinalizationCommitteeParameters,
} from './util';
import ShowFinalizationCommitteeParameters from './FinalizationCommitteeParametersShow';
import { FormRewardFractionField as FractionFieldForm } from '../common/RewardFractionField/RewardFractionField';
import { UINT32_MAX } from '~/utils/basicHelpers';

const fieldNames: EqualRecord<FinalizationCommitteeParametersFields> = {
    minFinalizers: 'minFinalizers',
    maxFinalizers: 'maxFinalizers',
    relativeStakeThresholdFraction: 'relativeStakeThresholdFraction',
};

const validationRules = (name: string) => ({
    required: requiredMessage(name),
    min: {
        value: 1,
        message: `${name} must be positive`,
    },
    max: {
        value: UINT32_MAX,
        message: `${name} may not exceed ${UINT32_MAX}`,
    },
    validate: {
        mustBeAnInteger,
    },
});

/**
 * Component for creating an update finalization committee parameters transaction.
 */
export default function UpdateFinalizationCommitteeParametersFields({
    defaults,
    chainParameters,
}: UpdateProps): JSX.Element | null {
    if (
        isChainParametersV0(chainParameters) ||
        isChainParametersV1(chainParameters)
    ) {
        throw new Error('Connected node used outdated chainParameters format');
    }

    const current = getCurrentFinalizationCommitteeParameters(chainParameters);

    return (
        <div>
            <ShowFinalizationCommitteeParameters
                parameters={current}
                title="Current finalization committee parameters"
            />
            <h3>New finalization committee parameters</h3>
            <Form.Input
                className="body2 mB5"
                name={fieldNames.minFinalizers}
                defaultValue={
                    defaults.minFinalizers || current.minFinalizers.toString()
                }
                label={`New ${fieldDisplays.minFinalizers}`}
                placeholder={enterHere(fieldDisplays.minFinalizers)}
                rules={validationRules(fieldDisplays.minFinalizers)}
            />
            <Form.Input
                className="body2"
                name={fieldNames.maxFinalizers}
                defaultValue={
                    defaults.maxFinalizers || current.maxFinalizers.toString()
                }
                label={`New ${fieldDisplays.maxFinalizers}`}
                placeholder={enterHere(fieldDisplays.maxFinalizers)}
                rules={validationRules(fieldDisplays.maxFinalizers)}
            />
            <FractionFieldForm
                label={fieldDisplays.relativeStakeThresholdFraction}
                name={fieldNames.relativeStakeThresholdFraction}
                className="mV20"
                defaultValue={
                    defaults.relativeStakeThresholdFraction ||
                    current.relativeStakeThresholdFraction.toString()
                }
            />
        </div>
    );
}
