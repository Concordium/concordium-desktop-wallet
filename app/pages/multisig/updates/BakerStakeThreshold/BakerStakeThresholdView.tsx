import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { BlockSummary } from '~/node/NodeApiTypes';
import { BakerStakeThreshold } from '~/utils/types';
import withChainData, { ChainData } from '../../common/withChainData';

import { displayAsGTU } from '~/utils/gtu';

interface Props extends ChainData {
    bakerStakeThreshold: BakerStakeThreshold;
}

/**
 * Displays an overview of a baker stake threshold.
 */
export default withChainData(function BakerStakeThresholdView({
    bakerStakeThreshold,
    blockSummary,
}: Props) {
    function renderCurrentValue(bs: BlockSummary): JSX.Element {
        return (
            <>
                <h5 className="mB0">Current baker stake threshold</h5>
                <h3 className="mT10">
                    {displayAsGTU(
                        bs.updates.chainParameters.minimumThresholdForBaking
                    )}
                </h3>
            </>
        );
    }
    return (
        <div>
            {blockSummary ? (
                renderCurrentValue(blockSummary)
            ) : (
                <Loading inline />
            )}
            <h5 className="mB0">New baker stake threshold</h5>
            <h3 className="mT10">
                {displayAsGTU(bakerStakeThreshold.threshold)}
            </h3>
        </div>
    );
});
