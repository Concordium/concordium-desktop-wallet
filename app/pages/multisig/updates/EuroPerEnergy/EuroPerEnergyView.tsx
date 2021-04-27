import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { BlockSummary } from '~/utils/NodeApiTypes';
import { ExchangeRate } from '~/utils/types';
import { RelativeRateField } from '../../common/RelativeRateField';
import { fromExchangeRate } from '../../common/RelativeRateField/util';
import withBlockSummary, {
    WithBlockSummary,
} from '../../common/withBlockSummary';
import { commonFieldProps, getCurrentValue } from './util';

interface Props extends WithBlockSummary {
    exchangeRate: ExchangeRate;
}

/**
 * Displays an overview of a euro per energy transaction payload.
 */
export default withBlockSummary(function EuroPerEnergyView({
    exchangeRate,
    blockSummary,
}: Props) {
    function renderCurrentValue(bs: BlockSummary): JSX.Element {
        const currentValue = getCurrentValue(bs);

        return (
            <RelativeRateField
                {...commonFieldProps}
                label="Current euro per energy"
                value={fromExchangeRate(currentValue)}
                disabled
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
                {...commonFieldProps}
                label="New euro per energy rate"
                value={fromExchangeRate(exchangeRate)}
                disabled
            />
        </>
    );
});
