import React, { ComponentType, useState, useEffect } from 'react';
import { AccountTransaction } from '~/utils/types';
import { lookupName } from '~/utils/addressBookHelpers';

export interface WithNames {
    fromName?: string;
    toName?: string;
}

export interface WithTransaction extends WithNames {
    transaction: AccountTransaction;
}

/**
 * Component that injects the names of the transaction sender (and recipient) into the props.
 * Requires the component to have prop transaction containing an AccountTransaction.
 */
export default function withNames<TProps extends WithTransaction>(
    Component: ComponentType<TProps>
): ComponentType<Omit<TProps, keyof WithNames>> {
    return ({ transaction, ...props }) => {
        const [fromName, setFromName] = useState<string | undefined>();
        const [toName, setToName] = useState<string | undefined>();

        useEffect(() => {
            lookupName(transaction.sender)
                .then((name) => setFromName(name))
                .catch(() => {}); // lookupName will only reject if there is a problem with the database. In that case we ignore the error and just display the address only.
            if ('toAddress' in transaction.payload) {
                lookupName(transaction.payload.toAddress)
                    .then((name) => setToName(name))
                    .catch(() => {}); // lookupName will only reject if there is a problem with the database. In that case we ignore the error and just display the address only.
            }
        });
        const propsWithNames: TProps = {
            ...props,
            fromName,
            toName,
            transaction,
        } as TProps;

        return <Component {...propsWithNames} />;
    };
}
