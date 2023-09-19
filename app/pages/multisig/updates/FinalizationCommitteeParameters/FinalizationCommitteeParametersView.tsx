import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { FinalizationCommitteeParameters } from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import ShowFinalizationCommitteeParameters from './FinalizationCommitteeParametersShow';
import { getCurrentFinalizationCommitteeParameters } from './util';
import { assertChainParametersV2OrHigher } from '~/utils/blockSummaryHelpers';

interface Props extends ChainData {
    finalizationCommitteeParameters: FinalizationCommitteeParameters;
}

/**
 * Displays an overview of a finalization committee parameters update.
 */
export default withChainData(function FinalizationCommitteeParametersView({
    finalizationCommitteeParameters,
    chainParameters,
}: Props) {
    if (!chainParameters) {
        return <Loading inline />;
    }
    assertChainParametersV2OrHigher(chainParameters);

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
