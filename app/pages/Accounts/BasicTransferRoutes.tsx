import React from 'react';
import { Route, Switch } from 'react-router';

import routes from '~/constants/routes.json';
import EncryptedTransfer from '~/components/Transfers/EncryptedTransfer';
import ShieldAmount from '~/components/Transfers/ShieldAmount';
import SimpleTransfer from '~/components/Transfers/SimpleTransfer';
import UnshieldAmount from '~/components/Transfers/UnshieldAmount';
import { Account, PropsOf } from '~/utils/types';

interface Props {
    account: Account;
    children?: PropsOf<typeof Switch>['children'];
}

export default function BasicTransferRoutes({ account, children }: Props) {
    return (
        <Switch>
            <Route
                path={routes.ACCOUNTS_SIMPLETRANSFER}
                render={() => <SimpleTransfer account={account} />}
            />
            <Route
                path={routes.ACCOUNTS_SHIELDAMOUNT}
                render={() => <ShieldAmount account={account} />}
            />
            <Route
                path={routes.ACCOUNTS_ENCRYPTEDTRANSFER}
                render={() => <EncryptedTransfer account={account} />}
            />
            <Route
                path={routes.ACCOUNTS_UNSHIELDAMOUNT}
                render={() => <UnshieldAmount account={account} />}
            />
            {children}
        </Switch>
    );
}
