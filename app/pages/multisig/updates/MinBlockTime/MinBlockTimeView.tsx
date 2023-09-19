import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { MinBlockTime } from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import Label from '~/components/Label';
import { assertChainParametersV2OrHigher } from '~/utils/blockSummaryHelpers';

interface Props extends ChainData {
    minBlockTime: MinBlockTime;
}

/**
 * Displays an overview of a baker stake threshold.
 */
export default withChainData(function MinBlockTimeView({
    minBlockTime,
    chainParameters,
}: Props) {
    if (!chainParameters) {
        return <Loading inline />;
    }
    assertChainParametersV2OrHigher(chainParameters);

    return (
        <>
            <div>
                <Label className="mB5">Current minimum block time:</Label>
                <div className="body3 mono">
                    {chainParameters.minBlockTime.toString()} ms
                </div>
            </div>
            <div>
                <Label className="mB5">New minimum block time:</Label>
                <div className="body3 mono">
                    {minBlockTime.minBlockTime.toString()} ms
                </div>
            </div>
        </>
    );
});
