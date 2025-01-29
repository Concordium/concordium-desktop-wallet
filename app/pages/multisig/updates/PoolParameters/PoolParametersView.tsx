import React from 'react';
import { CcdAmount, PoolParametersV1 } from '@concordium/web-sdk';

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
    chainParameters,
    consensusStatus,
}: Props) {
    if (!consensusStatus || !chainParameters) {
        return <Loading inline />;
    }
    if (chainParameters.version === 0) {
        throw new Error('Connected node used outdated chainParameters format');
    }

    const newPoolParameters: PoolParametersV1 = {
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
        minimumEquityCapital: CcdAmount.fromMicroCcd(
            poolParameters.minimumEquityCapital
        ),
        capitalBound: poolParameters.capitalBound,
        leverageBound: poolParameters.leverageBound,
    };

    return (
        <>
            <PoolParametersShow
                poolParameters={convertRewardFractions(chainParameters)}
                title="Current pool parameters"
            />
            <PoolParametersShow
                poolParameters={newPoolParameters}
                title="New pool parameters"
            />
        </>
    );
});
