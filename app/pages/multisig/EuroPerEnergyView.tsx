import React from 'react';
import { Label } from 'semantic-ui-react';
import { ExchangeRate } from '../../utils/types';

interface Props {
    exchangeRate: ExchangeRate;
}

/**
 * Displays an overview of a euro per energy transaction payload.
 */
export default function EuroPerEnergyView({ exchangeRate }: Props) {
    return (
        <Label size="big">
            1 NRG = € {exchangeRate.numerator}/{exchangeRate.denominator}
        </Label>
    );
}
