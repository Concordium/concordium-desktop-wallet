import { PoolParametersV1 } from '@concordium/web-sdk';
import { CommissionRange, Fraction } from '~/utils/types';
import updateConstants from '~/constants/updateConstants.json';

export interface UpdatePoolParametersFields {
    passiveFinalizationCommission: number;
    passiveBakingCommission: number;
    passiveTransactionCommission: number;
    finalizationCommissionRange: CommissionRange;
    bakingCommissionRange: CommissionRange;
    transactionCommissionRange: CommissionRange;
    minimumEquityCapital: bigint;
    capitalBound: number;
    leverageBound: Fraction;
}

// TODO Should baker be displayed as block here?
export const fieldDisplays = {
    passiveFinalizationCommission: 'Passive finalization commission',
    passiveBakingCommission: 'Passive baker commission',
    passiveTransactionCommission: 'Passive transaction commission',
    finalizationCommissionRange: 'Finalization commission range',
    bakingCommissionRange: 'Baker commission range',
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
        passiveFinalizationCommission: toRewardFraction(
            pp.passiveFinalizationCommission
        ),
        passiveBakingCommission: toRewardFraction(pp.passiveBakingCommission),
        passiveTransactionCommission: toRewardFraction(
            pp.passiveTransactionCommission
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
