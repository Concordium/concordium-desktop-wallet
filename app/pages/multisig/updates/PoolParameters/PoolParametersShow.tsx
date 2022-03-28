import React from 'react';
import type { PoolParametersV1 } from '@concordium/node-sdk';
import { CommissionRangeField } from './CommissionRangeField';
import { RewardFractionField } from '../common/RewardFractionField/RewardFractionField';
import { RelativeRateField } from '../../common/RelativeRateField';
import { fieldDisplays } from './util';
import { displayAsCcd } from '~/utils/ccd';
import Label from '~/components/Label';

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
            <h3>{title}</h3>
            <div>
                <h5>L Pool commissions</h5>
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
                    className="mV20"
                    disabled
                />
                <RelativeRateField
                    label={`${fieldDisplays.leverageBound} (Total stake to equity capital)`}
                    value={{
                        numerator: leverageBound.numerator.toString(),
                        denominator: leverageBound.denominator.toString(),
                    }}
                    splitSymbol="/"
                    numeratorUnit={{
                        value: '',
                        position: 'postfix',
                    }}
                    denominatorUnit={{
                        value: '',
                        position: 'postfix',
                    }}
                    disabled
                    className="mB20"
                />
                <Label className="mB5">
                    {fieldDisplays.minimumEquityCapital}:
                </Label>
                <div className="body3 mono">
                    {displayAsCcd(minimumEquityCapital)}
                </div>
            </div>
        </section>
    );
}
