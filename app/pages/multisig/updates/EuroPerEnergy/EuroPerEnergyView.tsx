import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { ExchangeRate } from '~/utils/types';
import { RelativeRateField } from '../../common/RelativeRateField';
import { fromExchangeRate } from '../../common/RelativeRateField/util';
import withChainData, { ChainData } from '~/utils/withChainData';
import { commonFieldProps } from './util';

interface Props extends ChainData {
    exchangeRate: ExchangeRate;
}

/**
 * Displays an overview of a euro per energy transaction payload.
 */
export default withChainData(function EuroPerEnergyView({
    exchangeRate,
    chainParameters,
}: Props) {
    return (
        <>
            {chainParameters ? (
                <RelativeRateField
                    {...commonFieldProps}
                    label="Current euro per energy:"
                    value={fromExchangeRate(chainParameters.euroPerEnergy)}
                    display
                />
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
