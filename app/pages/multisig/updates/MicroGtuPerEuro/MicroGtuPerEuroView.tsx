import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { ensureBigIntValues } from '~/utils/exchangeRateHelpers';
import { BlockSummary } from '~/utils/NodeApiTypes';
import { ExchangeRate } from '~/utils/types';
import { RelativeRateField } from '../../common/RelativeRateField';
import withBlockSummary, {
    WithBlockSummary,
} from '../../common/withBlockSummary';
import { commonFieldProps, formatDenominator, getCurrentValue } from './util';

interface Props extends WithBlockSummary {
    exchangeRate: ExchangeRate;
}

/**
 * Displays an overview of a micro GTU per euro transaction payload.
 */
export default withBlockSummary(function MicroGtuPerEuroView({
    exchangeRate,
    blockSummary,
}: Props) {
    const newValue = ensureBigIntValues(exchangeRate);

    const fieldProps = {
        ...commonFieldProps,
        disabled: true,
    };

    function renderCurrentValue(bs: BlockSummary): JSX.Element {
        const currentValue = getCurrentValue(bs);

        return (
            <RelativeRateField
                {...fieldProps}
                label="Current micro GTU per euro rate"
                denominator={formatDenominator(
                    currentValue.denominator.toString()
                )}
                value={currentValue.numerator.toString()}
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
                denominator={formatDenominator(newValue.denominator.toString())}
                value={newValue.numerator.toString()}
            />
        </>
    );
});
