import React, { useEffect, useRef } from 'react';
import { Route, Switch } from 'react-router';
import { useSelector } from 'react-redux';
import routes from '~/constants/routes.json';
import EncryptedTransfer from '~/components/Transfers/EncryptedTransfer';
import ShieldAmount from '~/components/Transfers/ShieldAmount';
import SimpleTransfer from '~/components/Transfers/SimpleTransfer';
import UnshieldAmount from '~/components/Transfers/UnshieldAmount';
import { Account, PropsOf } from '~/utils/types';
import { RootState } from '~/store/store';
import FinalPage from '~/components/Transfers/FinalPage';
import ShowAccountAddress from './ShowAccountAddress';
import { viewingShieldedSelector } from '~/features/TransactionSlice';
import DecryptComponent from './DecryptComponent';
import TransactionLog from './TransactionLog';

const SIMPLE_TRANSACTIONS_LIMIT = 10;

interface Props {
    account: Account;
    children?: PropsOf<typeof Switch>['children'];
}

export default function BasicTransferRoutes({ account, children }: Props) {
    const { simpleView } = useSelector((s: RootState) => s.accounts);
    const viewingShielded = useSelector(viewingShieldedSelector);
    const abortRef = useRef<((reason?: string) => void) | undefined>(undefined);

    useEffect(() => {
        const { current } = abortRef;
        return () => {
            current?.();
        };
    }, [account?.address]);

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
            <Route path={routes.ACCOUNTS_ADDRESS}>
                <ShowAccountAddress
                    account={account}
                    disableClose={!simpleView}
                />
            </Route>
            <Route path={routes.ACCOUNTS_FINAL_PAGE} component={FinalPage} />
            {children}
            <Route path={routes.ACCOUNTS}>
                {viewingShielded && !account.allDecrypted ? (
                    <DecryptComponent account={account} />
                ) : (
                    <TransactionLog
                        abortRef={abortRef}
                        limitLatest={
                            simpleView ? SIMPLE_TRANSACTIONS_LIMIT : undefined
                        }
                    />
                )}
            </Route>
        </Switch>
    );
}
