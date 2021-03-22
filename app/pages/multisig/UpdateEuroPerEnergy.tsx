import React from 'react';
import Form from '~/components/Form';
import RelativeRateField from '~/components/Form/RelativeRateField';
import { noOp } from '~/utils/basicHelpers';
import { UpdateProps } from '../../utils/transactionTypes';
import { EqualRecord, ExchangeRate } from '../../utils/types';

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
            <Form.RelativeRateField
                name={fieldNames.euroPerEnergy}
                label="New euro per energy"
                unit="€"
                denominatorUnit="NRG"
                defaultValue={initialValue}
            />
        </>
    );
}
