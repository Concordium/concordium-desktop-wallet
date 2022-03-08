import React from 'react';
import type { PoolParametersV1 } from '@concordium/node-sdk';
import { CommissionRangeField } from './CommissionRangeField';
import { RewardFractionField } from '../common/RewardFractionField/RewardFractionField';
import { RelativeRateField } from '../../common/RelativeRateField';
import Input from '~/components/Form/Input';
import { fieldDisplays } from './util';

interface PoolParametersShowProps {
    poolParameters: PoolParametersV1;
    title: string;
}

export default function ShowPoolParameters({
    poolParameters: {
        finalizationCommissionLPool,
        bakingCommissionLPool,
        transactionCommissionLPool,
        finalizationCommissionRange,
        bakingCommissionRange,
        transactionCommissionRange,
        minimumEquityCapital,
        capitalBound,
        leverageBound,
    },
    title,
}: PoolParametersShowProps): JSX.Element {
    return (
        <section>
            <h5>{title}</h5>
            <div>
                <RewardFractionField
                    label={fieldDisplays.transactionCommissionLPool}
                    value={transactionCommissionLPool}
                    disabled
                />
                <RewardFractionField
                    label={fieldDisplays.bakingCommissionLPool}
                    value={bakingCommissionLPool}
                    disabled
                />
                <RewardFractionField
                    label={fieldDisplays.finalizationCommissionLPool}
                    value={finalizationCommissionLPool}
                    disabled
                />
                <CommissionRangeField
                    label={fieldDisplays.transactionCommissionRange}
                    value={transactionCommissionRange}
                    disabled
                />
                <CommissionRangeField
                    label={fieldDisplays.bakingCommissionRange}
                    value={bakingCommissionRange}
                    disabled
                />
                <CommissionRangeField
                    label={fieldDisplays.finalizationCommissionRange}
                    value={finalizationCommissionRange}
                    disabled
                />
                <RewardFractionField
                    label={fieldDisplays.capitalBound}
                    value={capitalBound}
                    disabled
                />
                <RelativeRateField
                    label={fieldDisplays.leverageBound}
                    value={{
                        numerator: leverageBound.numerator.toString(),
                        denominator: leverageBound.denominator.toString(),
                    }}
                    numeratorUnit={{
                        value: ' max delegator stake',
                        position: 'postfix',
                    }}
                    denominatorUnit={{
                        value: ' equity capital',
                        position: 'postfix',
                    }}
                    disabled
                    className="mB20"
                />
                <Input
                    className="body2"
                    label={fieldDisplays.minimumEquityCapital}
                    value={minimumEquityCapital.toString()}
                    disabled
                />
            </div>
        </section>
    );
}
