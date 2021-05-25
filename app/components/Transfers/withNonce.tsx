import React, { ComponentType, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Account } from '~/utils/types';
import { getNextAccountNonce } from '~/utils/nodeRequests';
import { unabletoReachNode } from '~/constants/errorMessages';
import { routerActions } from 'connected-react-router';
import SimpleErrorModal from '~/components/SimpleErrorModal';

export interface Nonce {
    nonce?: string;
}

export interface WithAccount extends Nonce {
    account: Account;
}

/**
 * Component that injects the names of the transaction sender (and recipient) into the props.
 * Requires the component to have prop transaction containing an AccountTransaction.
 */
export default function withNonce<TProps extends WithAccount>(
    Component: ComponentType<TProps>
): ComponentType<Omit<TProps, keyof Nonce>> {
    return ({ account, ...props }) => {
        const dispatch = useDispatch();
        const [nonce, setNonce] = useState<string | undefined>();
        const [showError, setShowError] = useState<boolean>(false);

        useEffect(() => {
            getNextAccountNonce(account.address).then((accountNonce) => setNonce(accountNonce.nonce)).catch(() => setShowError(true));
        }, []);

        const propsWithNonce: TProps = {
            ...props,
            account,
            nonce,
        } as TProps;

        return (
            <>
                <SimpleErrorModal
                    show={showError}
                    header="Unable to reach node"
                    content={unabletoReachNode}
                    onClick={() => dispatch(routerActions.goBack())}
                />
                <Component {...propsWithNonce} />
            </>);
    };
}

export function ensureNonce<TProps extends WithAccount>(Component: ComponentType<TProps>, FallBack: ComponentType<any>) {
    return withNonce<TProps>(
        (props) => {
            const { nonce } = props;

            if (!nonce) {
                return <FallBack />;
            }

            return <Component {...props} />;
        }
    );
};
