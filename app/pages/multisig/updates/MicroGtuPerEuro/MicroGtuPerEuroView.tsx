import React from 'react';
import { Label } from 'semantic-ui-react';
import { getGTUSymbol } from '../../../../utils/gtu';
import { ExchangeRate } from '../../../../utils/types';

interface Props {
    exchangeRate: ExchangeRate;
}

/**
 * Displays an overview of a micro GTU per euro transaction payload.
 */
export default function MicroGtuPerEuroView({ exchangeRate }: Props) {
    return (
        <Label size="big">
            € 1.00 = µ{getGTUSymbol()} {exchangeRate.numerator}/
            {exchangeRate.denominator}
        </Label>
    );
}
