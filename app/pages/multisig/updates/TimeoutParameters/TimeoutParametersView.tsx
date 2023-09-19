import React from 'react';
import { isChainParametersV0, isChainParametersV1 } from '@concordium/web-sdk';
import Loading from '~/cross-app-components/Loading';
import { TimeoutParameters } from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import ShowTimeoutParameters from './TimeoutParametersShow';
import { getTimeoutParameters } from './util';

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

    if (
        isChainParametersV0(chainParameters) ||
        isChainParametersV1(chainParameters)
    ) {
        throw new Error('Connected node used outdated chainParameters format');
    }

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
