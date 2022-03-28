import { PoolParametersV1 } from '@concordium/node-sdk';
import { CommissionRange, Fraction } from '~/utils/types';
import updateConstants from '~/constants/updateConstants.json';

export interface UpdatePoolParametersFields {
    finalizationCommissionLPool: number;
    bakingCommissionLPool: number;
    transactionCommissionLPool: number;
    finalizationCommissionRange: CommissionRange;
    bakingCommissionRange: CommissionRange;
    transactionCommissionRange: CommissionRange;
    minimumEquityCapital: bigint;
    capitalBound: number;
    leverageBound: Fraction;
}

export const fieldDisplays = {
    finalizationCommissionLPool: 'Finalization commission L-pool',
    bakingCommissionLPool: 'baking commission L-pool',
    transactionCommissionLPool: 'Transaction commission L-pool',
    finalizationCommissionRange: 'Finalization commission range',
    bakingCommissionRange: 'Baking commission range',
    transactionCommissionRange: 'Transaction commission range',
    minimumEquityCapital: 'Minimum equity capital',
    capitalBound: 'Capital bound',
    leverageBound: 'Leverage bound',
};

function toRewardFraction(a: number): number {
    return a * updateConstants.rewardFractionResolution;
}
function toRewardFractionRange(range: CommissionRange): CommissionRange {
    return {
        min: range.min * updateConstants.rewardFractionResolution,
        max: range.max * updateConstants.rewardFractionResolution,
    };
}

export function convertRewardFractions(pp: PoolParametersV1): PoolParametersV1 {
    return {
        finalizationCommissionLPool: toRewardFraction(
            pp.finalizationCommissionLPool
        ),
        bakingCommissionLPool: toRewardFraction(pp.bakingCommissionLPool),
        transactionCommissionLPool: toRewardFraction(
            pp.transactionCommissionLPool
        ),
        finalizationCommissionRange: toRewardFractionRange(
            pp.finalizationCommissionRange
        ),
        bakingCommissionRange: toRewardFractionRange(pp.bakingCommissionRange),
        transactionCommissionRange: toRewardFractionRange(
            pp.transactionCommissionRange
        ),
        minimumEquityCapital: pp.minimumEquityCapital,
        capitalBound: toRewardFraction(pp.capitalBound),
        leverageBound: pp.leverageBound,
    };
}
