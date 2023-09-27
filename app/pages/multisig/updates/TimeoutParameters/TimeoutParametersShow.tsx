import React from 'react';
import { TimeoutParametersFields, fieldDisplays } from './util';
import Label from '~/components/Label';
import { RelativeRateField } from '../../common/RelativeRateField';

interface PoolParametersShowProps {
    parameters: TimeoutParametersFields;
    title: string;
}

export default function ShowFinalizationCommitteeParameters({
    parameters: { timeoutBase, timeoutDecrease, timeoutIncrease },
    title,
}: PoolParametersShowProps): JSX.Element {
    return (
        <section className="mB40">
            <h3>{title}</h3>
            <div>
                <Label className="mB5">{fieldDisplays.timeoutBase}</Label>
                <div className="body3 mono mB10">
                    {timeoutBase.toString()} ms
                </div>
                <RelativeRateField
                    className="mB10"
                    label={fieldDisplays.timeoutIncrease}
                    value={timeoutIncrease}
                    splitSymbol="/"
                    display
                />
                <RelativeRateField
                    label={fieldDisplays.timeoutDecrease}
                    value={timeoutDecrease}
                    splitSymbol="/"
                    display
                />
            </div>
        </section>
    );
}
