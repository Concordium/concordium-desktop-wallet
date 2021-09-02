import React from 'react';
import { Route, Switch } from 'react-router';

import { useSelector } from 'react-redux';
import routes from '~/constants/routes.json';
import EncryptedTransfer from '~/components/Transfers/EncryptedTransfer';
import ShieldAmount from '~/components/Transfers/ShieldAmount';
import SimpleTransfer from '~/components/Transfers/SimpleTransfer';
import UnshieldAmount from '~/components/Transfers/UnshieldAmount';
import { Account, PropsOf } from '~/utils/types';
import { RootState } from '~/store/store';

interface Props {
    account: Account;
    children?: PropsOf<typeof Switch>['children'];
}

export default function BasicTransferRoutes({ account, children }: Props) {
    const { simpleView } = useSelector((s: RootState) => s.accounts);
    return (
        <Switch>
            <Route
                path={routes.ACCOUNTS_SIMPLETRANSFER}
                render={() => (
                    <SimpleTransfer
                        account={account}
                        disableClose={!simpleView}
                    />
                )}
            />
            <Route
                path={routes.ACCOUNTS_SHIELDAMOUNT}
                render={() => (
                    <ShieldAmount
                        account={account}
                        disableClose={!simpleView}
                    />
                )}
            />
            <Route
                path={routes.ACCOUNTS_ENCRYPTEDTRANSFER}
                render={() => (
                    <EncryptedTransfer
                        account={account}
                        disableClose={!simpleView}
                    />
                )}
            />
            <Route
                path={routes.ACCOUNTS_UNSHIELDAMOUNT}
                render={() => (
                    <UnshieldAmount
                        account={account}
                        disableClose={!simpleView}
                    />
                )}
            />
            {children}
        </Switch>
    );
}
