import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { BlockSummary } from '~/utils/NodeApiTypes';
import { ExchangeRate } from '~/utils/types';
import { RelativeRateField } from '../../common/RelativeRateField';
import { fromExchangeRate } from '../../common/RelativeRateField/util';
import withChainData, { ChainData } from '../../common/withChainData';
import { commonFieldProps, getCurrentValue } from './util';

interface Props extends ChainData {
    exchangeRate: ExchangeRate;
}

/**
 * Displays an overview of a micro GTU per euro transaction payload.
 */
export default withChainData(function MicroGtuPerEuroView({
    exchangeRate,
    blockSummary,
}: Props) {
    function renderCurrentValue(bs: BlockSummary): JSX.Element {
        const currentValue = getCurrentValue(bs);

        return (
            <RelativeRateField
                {...commonFieldProps}
                label="Current micro GTU per euro rate"
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
                label="New micro GTU per euro rate"
                value={fromExchangeRate(exchangeRate)}
                disabled
            />
        </>
    );
});
