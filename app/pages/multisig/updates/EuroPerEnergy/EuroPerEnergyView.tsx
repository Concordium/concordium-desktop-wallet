import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { ensureBigIntValues } from '~/utils/exchangeRateHelpers';
import { BlockSummary } from '~/utils/NodeApiTypes';
import { ExchangeRate } from '~/utils/types';
import {
    RelativeRateField,
    RelativeRateFieldProps,
} from '../../common/RelativeRateField';
import { useNormalisation } from '../../common/RelativeRateField/util';
import withBlockSummary, {
    WithBlockSummary,
} from '../../common/withBlockSummary';
import { getCurrentValue } from './util';

interface Props extends WithBlockSummary {
    exchangeRate: ExchangeRate;
}

/**
 * Displays an overview of a euro per energy transaction payload.
 */
export default withBlockSummary(function MicroGtuPerEuroView({
    exchangeRate,
    blockSummary,
}: Props) {
    const newValue = ensureBigIntValues(exchangeRate);
    const fieldProps: Pick<
        RelativeRateFieldProps,
        'unit' | 'denominatorUnit' | 'disabled'
    > = {
        unit: { position: 'prefix', value: '€ ' },
        denominatorUnit: { position: 'postfix', value: ' NRG' },
        disabled: true,
    };

    // We can use the same for both current and new values, as it's not possible to update the denominator.
    const { safeToFraction, isNormalised } = useNormalisation(
        newValue.denominator
    );
    const getNormalisedDenominator = (denominator: bigint) =>
        isNormalised ? '1' : denominator.toString();

    function renderCurrentValue(bs: BlockSummary): JSX.Element {
        const currentValue = getCurrentValue(bs);

        return (
            <RelativeRateField
                {...fieldProps}
                label="Current micro GTU per euro rate"
                denominator={getNormalisedDenominator(currentValue.denominator)}
                value={safeToFraction(currentValue.numerator)}
            />
        );
    }

    return (
        <>
            {blockSummary ? (
                renderCurrentValue(blockSummary)
            ) : (
                <Loading inline />
            )}
            <RelativeRateField
                {...fieldProps}
                label="New micro GTU per euro rate"
                denominator={getNormalisedDenominator(newValue.denominator)}
                value={safeToFraction(newValue.numerator)}
            />
        </>
    );
});
