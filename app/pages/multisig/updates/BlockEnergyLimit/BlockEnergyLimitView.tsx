import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { BlockEnergyLimit } from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import Label from '~/components/Label';
import { assertChainParametersV2OrHigher } from '~/utils/blockSummaryHelpers';

interface Props extends ChainData {
    blockEnergyLimit: BlockEnergyLimit;
}

/**
 * Displays an overview of a block energy limit transaction.
 */
export default withChainData(function BlockEnergyLimitView({
    blockEnergyLimit,
    chainParameters,
}: Props) {
    if (!chainParameters) {
        return <Loading inline />;
    }
    assertChainParametersV2OrHigher(chainParameters);

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
