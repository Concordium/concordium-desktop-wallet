import React, { ComponentType, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { routerActions } from 'connected-react-router';
import { Account } from '~/utils/types';
import { hasPendingShieldedBalanceTransfer } from '~/database/TransactionDao';
import SimpleErrorModal from '~/components/SimpleErrorModal';

export interface WithAccount {
    account: Account;
}

/**
 * Component that ensures the account does not have have a pending shielded balance transaction.
 * Requires the component to have prop account containing an Account.
 */
export default function ensureNoPendingShieldedBalance<
    TProps extends WithAccount
>(Component: ComponentType<TProps>): ComponentType<TProps> {
    const EnsureNoPendingShieldedBalanceComponent = (props: TProps) => {
        const { account } = props;
        const dispatch = useDispatch();
        const [showError, setShowError] = useState<boolean>(false);

        useEffect(() => {
            hasPendingShieldedBalanceTransfer(account.address)
                .then(setShowError)
                .catch(() => {});
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [account.address]);

        return (
            <>
                <SimpleErrorModal
                    show={showError}
                    header="Account has pending transfer impacting shielded balance"
                    content="Please wait for any pending shield amounts, unshield amounts or shielded transfers to finalize."
                    onClick={() => dispatch(routerActions.goBack())}
                />
                <Component {...props} />
            </>
        );
    };
    return EnsureNoPendingShieldedBalanceComponent;
}
