import React from 'react';
import { isChainParametersV0, isChainParametersV1 } from '@concordium/web-sdk';
import Loading from '~/cross-app-components/Loading';
import { MinBlockTime } from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import Label from '~/components/Label';

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

    if (
        isChainParametersV0(chainParameters) ||
        isChainParametersV1(chainParameters)
    ) {
        throw new Error('Connected node used outdated chainParameters format');
    }

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
