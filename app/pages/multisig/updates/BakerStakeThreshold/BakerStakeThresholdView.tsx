import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { ChainParameters } from '~/node/NodeApiTypes';
import { BakerStakeThreshold } from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import { displayAsCcd } from '~/utils/ccd';
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
    chainParameters,
}: Props) {
    function renderCurrentValue(cp: ChainParameters): JSX.Element {
        return (
            <div>
                <Label className="mB5">Current baker stake threshold:</Label>
                <div className="body3 mono">
                    {displayAsCcd(getMinimumStakeForBaking(cp))}
                </div>
            </div>
        );
    }
    return (
        <>
            {chainParameters ? (
                renderCurrentValue(chainParameters)
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
