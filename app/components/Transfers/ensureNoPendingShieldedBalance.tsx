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
 * Component that injects the next nonce on the given account.
 * Requires the component to have prop account containing an Account.
 */
export default function ensureNoPendingShieldedBalance<
    TProps extends WithAccount
>(Component: ComponentType<TProps>): ComponentType<TProps> {
    const EnsureNoPendingShieldedBalanceComponent = ({
        account,
        ...props
    }: TProps) => {
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
                    onClick={() => dispatch(routerActions.goBack())}
                />
                <Component {...props} account={account} />
            </>
        );
    };
    return EnsureNoPendingShieldedBalanceComponent;
}
