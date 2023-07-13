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
 * Displays an overview of a micro CCD per euro transaction payload.
 */
export default withChainData(function MicroGtuPerEuroView({
    exchangeRate,
    chainParameters,
}: Props) {
    return (
        <>
            {chainParameters ? (
                <RelativeRateField
                    {...commonFieldProps}
                    label="Current micro CCD per euro rate:"
                    value={fromExchangeRate(chainParameters.microGTUPerEuro)}
                    display
                />
            ) : (
                <Loading inline />
            )}
            <RelativeRateField
                {...commonFieldProps}
                label="New micro CCD per euro rate:"
                value={fromExchangeRate(exchangeRate)}
                display
            />
        </>
    );
});
