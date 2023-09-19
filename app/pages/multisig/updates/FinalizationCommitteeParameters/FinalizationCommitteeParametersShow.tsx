import React from 'react';
import { RewardFractionField } from '../common/RewardFractionField/RewardFractionField';
import { fieldDisplays } from './util';
import Label from '~/components/Label';
import { FinalizationCommitteeParameters } from '~/utils/types';

interface PoolParametersShowProps {
    parameters: FinalizationCommitteeParameters;
    title: string;
}

export default function ShowFinalizationCommitteeParameters({
    parameters: {
        minFinalizers,
        maxFinalizers,
        relativeStakeThresholdFraction,
    },
    title,
}: PoolParametersShowProps): JSX.Element {
    return (
        <section className="mB40">
            <h3>{title}</h3>
            <div>
                <Label className="mB5">{fieldDisplays.minFinalizers}:</Label>
                <div className="body3 mono mB10">{minFinalizers}</div>
                <Label className="mB5">{fieldDisplays.maxFinalizers}:</Label>
                <div className="body3 mono mB10">{maxFinalizers}</div>
                <RewardFractionField
                    label={fieldDisplays.relativeStakeThresholdFraction}
                    value={relativeStakeThresholdFraction}
                    disabled
                />
            </div>
        </section>
    );
}
