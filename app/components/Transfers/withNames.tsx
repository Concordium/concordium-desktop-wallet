import React, { ComponentType, useState, useEffect } from 'react';
import { AccountTransaction } from '../../utils/types';
import { lookupName } from '../../utils/transactionHelpers';

export interface WithNames {
    fromName?: string;
    toName?: string;
}

export interface WithTransaction extends WithNames {
    transaction: AccountTransaction;
}

/**
 * Component that displays the details of an AccountTransaction in a human readable way.
 * @param {AccountTransaction} transaction: The transaction, which details is displayed.
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
        const propsWithBlockSummary: TProps = {
            ...props,
            fromName,
            toName,
            transaction,
        } as TProps;

        return <Component {...propsWithBlockSummary} />;
    };
}
