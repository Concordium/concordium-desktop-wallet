import React from 'react';
import { isBlockSummaryV1 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import { PoolParameters } from '~/utils/types';
import Loading from '~/cross-app-components/Loading';
import withChainData, { ChainData } from '~/utils/withChainData';
import PoolParametersShow from './PoolParametersShow';
import { convertRewardFractions } from './util';

interface Props extends ChainData {
    poolParameters: PoolParameters;
}

/**
 * Displays an overview of a mint distribution transaction payload.
 */
export default withChainData(function PoolParametersView({
    poolParameters,
    blockSummary,
    consensusStatus,
}: Props) {
    if (!consensusStatus || !blockSummary) {
        return <Loading />;
    }
    if (!isBlockSummaryV1(blockSummary)) {
        throw new Error('Connected node used outdated blockSummary format');
    }

    const newPoolParameters = {
        finalizationCommissionLPool:
            poolParameters.lPoolCommissions.finalizationRewardCommission,
        bakingCommissionLPool:
            poolParameters.lPoolCommissions.bakingRewardCommission,
        transactionCommissionLPool:
            poolParameters.lPoolCommissions.transactionFeeCommission,
        finalizationCommissionRange:
            poolParameters.commissionBounds.finalizationRewardCommission,
        bakingCommissionRange:
            poolParameters.commissionBounds.bakingRewardCommission,
        transactionCommissionRange:
            poolParameters.commissionBounds.transactionFeeCommission,
        minimumEquityCapital: poolParameters.minimumEquityCapital,
        capitalBound: poolParameters.capitalBound,
        leverageBound: poolParameters.leverageBound,
    };

    return (
        <>
            <PoolParametersShow
                poolParameters={convertRewardFractions(
                    blockSummary.updates.chainParameters
                )}
                title="Current pool parameters"
            />
            <PoolParametersShow
                poolParameters={newPoolParameters}
                title="New pool parameters"
            />
        </>
    );
});
