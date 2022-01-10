import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { BlockSummary } from '~/node/NodeApiTypes';
import { ExchangeRate } from '~/utils/types';
import { RelativeRateField } from '../../common/RelativeRateField';
import { fromExchangeRate } from '../../common/RelativeRateField/util';
import withChainData, { ChainData } from '../../common/withChainData';
import { commonFieldProps, getCurrentValue } from './util';

interface Props extends ChainData {
    exchangeRate: ExchangeRate;
}

/**
 * Displays an overview of a euro per energy transaction payload.
 */
export default withChainData(function EuroPerEnergyView({
    exchangeRate,
    blockSummary,
}: Props) {
    function renderCurrentValue(bs: BlockSummary): JSX.Element {
        const currentValue = getCurrentValue(bs);

        return (
            <RelativeRateField
                {...commonFieldProps}
                label="Current euro per energy:"
                value={fromExchangeRate(currentValue)}
                display
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
                label="New euro per energy rate:"
                value={fromExchangeRate(exchangeRate)}
                display
            />
        </>
    );
});
