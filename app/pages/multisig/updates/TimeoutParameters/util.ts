import { TimeoutParameters } from '@concordium/web-sdk';
import { RelativeRateValue } from '../../common/RelativeRateField/util';

export interface TimeoutParametersFields {
    timeoutBase: bigint;
    timeoutIncrease: RelativeRateValue;
    timeoutDecrease: RelativeRateValue;
}

export const fieldDisplays = {
    timeoutBase: 'Timeout base',
    timeoutIncrease: 'Timeout increase',
    timeoutDecrease: 'Timeout decrease',
};

export function getTimeoutParameters(
    chainParameters: TimeoutParameters
): TimeoutParametersFields {
    return {
        timeoutBase: chainParameters.timeoutBase,
        timeoutIncrease: {
            numerator: chainParameters.timeoutIncrease.numerator.toString(),
            denominator: chainParameters.timeoutIncrease.denominator.toString(),
        },
        timeoutDecrease: {
            numerator: chainParameters.timeoutDecrease.numerator.toString(),
            denominator: chainParameters.timeoutDecrease.denominator.toString(),
        },
    };
}
