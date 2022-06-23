import React from 'react';
import { displayAsCcd } from 'wallet-common-helpers/lib/utils/ccd';
import Loading from '~/cross-app-components/Loading';
import { BlockSummary } from '~/node/NodeApiTypes';
import { BakerStakeThreshold } from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import Label from '~/components/Label';
import { getMinimumStakeForBaking } from '~/utils/blockSummaryHelpers';

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
            <div>
                <Label className="mB5">Current baker stake threshold:</Label>
                <div className="body3 mono">
                    {displayAsCcd(getMinimumStakeForBaking(bs))}
                </div>
            </div>
        );
    }
    return (
        <>
            {blockSummary ? (
                renderCurrentValue(blockSummary)
            ) : (
                <Loading inline />
            )}
            <div>
                <Label className="mB5">New baker stake threshold:</Label>
                <div className="body3 mono">
                    {displayAsCcd(bakerStakeThreshold.threshold)}
                </div>
            </div>
        </>
    );
});
