import React from 'react';
import { noOp } from '~/utils/basicHelpers';
import { UpdateProps } from '~/utils/transactionTypes';
import { EqualRecord, ExchangeRate } from '~/utils/types';
import {
    RelativeRateField,
    FormRelativeRateField,
} from './common/RelativeRateField';

export interface UpdateEuroPerEnergyFields {
    euroPerEnergy: ExchangeRate;
}

const fieldNames: EqualRecord<UpdateEuroPerEnergyFields> = {
    euroPerEnergy: 'euroPerEnergy',
};

export default function UpdateEuroPerEnergy({ blockSummary }: UpdateProps) {
    const initialValue = blockSummary.updates.chainParameters.euroPerEnergy;

    return (
        <>
            <RelativeRateField
                label="Current euro per energy"
                unit="€"
                denominatorUnit="NRG"
                value={initialValue}
                onChange={noOp}
                onBlur={noOp}
                disabled
            />
            <FormRelativeRateField
                name={fieldNames.euroPerEnergy}
                label="New euro per energy"
                unit="€"
                denominatorUnit="NRG"
                defaultValue={initialValue}
            />
        </>
    );
}
