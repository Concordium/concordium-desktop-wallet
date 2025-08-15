import React from 'react';
import { ValidatorScoreParameters } from '@concordium/web-sdk';

import Loading from '~/cross-app-components/Loading';
import withChainData, { ChainData } from '~/utils/withChainData';
import Label from '~/components/Label';
import { fieldDisplays } from './UpdateValidatorScoreParameters';
import { isMinChainParametersV3 } from '~/utils/types';

interface Props extends ChainData {
    validatorScoreParameters: ValidatorScoreParameters;
}

/**
 * Displays an overview of an update validatorScore transaction payload.
 */
export default withChainData(function ValidatorScoreParametersView({
    validatorScoreParameters: { maxMissedRounds: next },
    chainParameters,
    consensusStatus,
}: Props) {
    if (!consensusStatus || !chainParameters) {
        return <Loading inline />;
    }
    if (!isMinChainParametersV3(chainParameters)) {
        throw new Error('Connected node used outdated chainParameters format');
    }

    const {
        maxMissedRounds: current,
    } = chainParameters.validatorScoreParameters;

    return (
        <>
            <div>
                <Label className="mB5">
                    Current {fieldDisplays.maxMissedRounds}:
                </Label>
                <div className="body3 mono mB20">
                    {current.toString()} rounds
                </div>
            </div>
            <div>
                <Label className="mB5">
                    New {fieldDisplays.maxMissedRounds}:
                </Label>
                <div className="body3 mono mB20">{next.toString()} rounds</div>
            </div>
        </>
    );
});
