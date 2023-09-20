import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { TimeoutParameters } from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import ShowTimeoutParameters from './TimeoutParametersShow';
import { getTimeoutParameters } from './util';
import { assertChainParametersV2OrHigher } from '~/utils/blockSummaryHelpers';

interface Props extends ChainData {
    timeoutParameters: TimeoutParameters;
}

/**
 * Displays an overview of a timeout parameter update.
 */
export default withChainData(function TimeoutParametersView({
    timeoutParameters,
    chainParameters,
}: Props) {
    if (!chainParameters) {
        return <Loading inline />;
    }
    assertChainParametersV2OrHigher(chainParameters);

    const current = getTimeoutParameters(chainParameters);
    const newParameters = getTimeoutParameters(timeoutParameters);

    return (
        <>
            <ShowTimeoutParameters
                parameters={current}
                title="Current timeout parameters"
            />
            <ShowTimeoutParameters
                parameters={newParameters}
                title="New timeout parameters"
            />
        </>
    );
});
