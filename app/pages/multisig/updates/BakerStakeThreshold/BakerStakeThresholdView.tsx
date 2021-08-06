import React from 'react';
import { BlockSummary } from '@concordium/node-sdk';
import Loading from '~/cross-app-components/Loading';
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
                <div className="body1 mT10">
                    {displayAsGTU(
                        bs.updates.chainParameters.minimumThresholdForBaking
                    )}
                </div>
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
            <div className="body1 mT10">
                {displayAsGTU(bakerStakeThreshold.threshold)}
            </div>
        </div>
    );
});
