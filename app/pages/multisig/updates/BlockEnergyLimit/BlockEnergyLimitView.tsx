import React from 'react';
import { isChainParametersV0, isChainParametersV1 } from '@concordium/web-sdk';
import Loading from '~/cross-app-components/Loading';
import { BlockEnergyLimit } from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import Label from '~/components/Label';

interface Props extends ChainData {
    blockEnergyLimit: BlockEnergyLimit;
}

/**
 * Displays an overview of a baker stake threshold.
 */
export default withChainData(function BlockEnergyLimitView({
    blockEnergyLimit,
    chainParameters,
}: Props) {
    if (!chainParameters) {
        return <Loading inline />;
    }

    if (
        isChainParametersV0(chainParameters) ||
        isChainParametersV1(chainParameters)
    ) {
        throw new Error('Connected node used outdated chainParameters format');
    }

    return (
        <>
            <div>
                <Label className="mB5">Current block energy limit:</Label>
                <div className="body3 mono">
                    {chainParameters.blockEnergyLimit.toString()}
                </div>
            </div>
            <div>
                <Label className="mB5">New block energy limit:</Label>
                <div className="body3 mono">
                    {blockEnergyLimit.blockEnergyLimit.toString()}
                </div>
            </div>
        </>
    );
});
