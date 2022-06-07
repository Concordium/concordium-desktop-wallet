import React from 'react';
import { isBlockSummaryV0 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
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
        return <Loading inline />;
    }
    if (isBlockSummaryV0(blockSummary)) {
        throw new Error('Connected node used outdated blockSummary format');
    }

    const newPoolParameters = {
        passiveFinalizationCommission:
            poolParameters.passiveCommissions.finalizationRewardCommission,
        passiveBakingCommission:
            poolParameters.passiveCommissions.bakingRewardCommission,
        passiveTransactionCommission:
            poolParameters.passiveCommissions.transactionFeeCommission,
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
