import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { ensureBigIntValues } from '~/utils/exchangeRateHelpers';
import { BlockSummary } from '~/utils/NodeApiTypes';
import { ExchangeRate } from '~/utils/types';
import { RelativeRateField } from '../../common/RelativeRateField';
import { useNormalisation } from '../../common/RelativeRateField/util';
import withBlockSummary, {
    WithBlockSummary,
} from '../../common/withBlockSummary';
import { getCommonFieldProps, getCurrentValue } from './util';

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

    // We can use the same for both current and new values, as it's not possible to update the denominator.
    const { safeToFraction, isNormalised } = useNormalisation(
        newValue.denominator
    );
    const getNormalisedDenominator = (denominator: bigint) =>
        isNormalised ? '1' : denominator.toString();

    const fieldProps = {
        ...getCommonFieldProps(isNormalised),
        disabled: true,
    };

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
