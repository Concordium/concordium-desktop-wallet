import React, { ComponentType, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { routerActions } from 'connected-react-router';
import { Fraction } from '~/utils/types';
import { getEnergyToMicroGtuRate } from '~/node/nodeHelpers';
import errorMessages from '~/constants/errorMessages.json';
import SimpleErrorModal from '~/components/SimpleErrorModal';

export interface ExchangeRate {
    exchangeRate?: Fraction;
}

/**
 * Component that injects the current exchange rate between energy and ccd into the props.
 */
export default function withExchangeRate<TProps extends ExchangeRate>(
    Component: ComponentType<TProps>
): ComponentType<Omit<TProps, keyof ExchangeRate>> {
    return (props) => {
        const dispatch = useDispatch();
        const [exchangeRate, setExchangeRate] = useState<
            Fraction | undefined
        >();
        const [showError, setShowError] = useState<boolean>(false);

        useEffect(() => {
            getEnergyToMicroGtuRate()
                .then(setExchangeRate)
                .catch(() => setShowError(true));
        }, []);

        const propsWithExchangeRate: TProps = {
            ...props,
            exchangeRate,
        } as TProps;

        return (
            <>
                <SimpleErrorModal
                    show={showError}
                    header={errorMessages.unableToReachNode}
                    onClick={() => dispatch(routerActions.goBack())}
                />
                <Component {...propsWithExchangeRate} />
            </>
        );
    };
}

export function ensureExchangeRate<TProps extends ExchangeRate>(
    Component: ComponentType<TProps>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FallBack: ComponentType<any>
) {
    return withExchangeRate<TProps>((props) => {
        const { exchangeRate } = props;

        if (!exchangeRate) {
            return <FallBack />;
        }

        return <Component {...props} />;
    });
}
