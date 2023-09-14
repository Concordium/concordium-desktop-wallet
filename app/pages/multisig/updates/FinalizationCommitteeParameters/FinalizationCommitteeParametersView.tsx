import React from 'react';
import { isChainParametersV0, isChainParametersV1 } from '@concordium/web-sdk';
import Loading from '~/cross-app-components/Loading';
import { FinalizationCommitteeParameters } from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import ShowFinalizationCommitteeParameters from './FinalizationCommitteeParametersShow';
import { getCurrentFinalizationCommitteeParameters } from './util';

interface Props extends ChainData {
    finalizationCommitteeParameters: FinalizationCommitteeParameters;
}

/**
 * Displays an overview of a baker stake threshold.
 */
export default withChainData(function FinalizationCommitteeParametersView({
    finalizationCommitteeParameters,
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

    const current = getCurrentFinalizationCommitteeParameters(chainParameters);

    return (
        <>
            <ShowFinalizationCommitteeParameters
                parameters={current}
                title="Current finalization committee parameters"
            />
            <ShowFinalizationCommitteeParameters
                parameters={finalizationCommitteeParameters}
                title="New finalization committee parameters"
            />
        </>
    );
});
