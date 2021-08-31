import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { push } from 'connected-react-router';

import NoIdentities from '~/components/NoIdentities';
import {
    accountsSelector,
    loadAccountInfos,
    loadAccounts,
} from '~/features/AccountSlice';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import { RootState } from '~/store/store';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import routes from '~/constants/routes.json';

import useAccountSync from './useAccountSync';
import AccountListPage from './AccountListPage';
import AccountDetailsPage from './AccountDetailsPage';

const { Header } = MasterDetailPageLayout;

async function load(dispatch: Dispatch) {
    const accounts = await loadAccounts(dispatch);
    return loadAccountInfos(accounts, dispatch);
}

export default function AccountsPage() {
    const accounts = useSelector(accountsSelector);
    const dispatch = useDispatch();
    useAccountSync();
    const { simpleView } = useSelector((s: RootState) => s.accounts);
    const [error, setError] = useState<string>();

    useEffect(() => {
        load(dispatch).catch((e: Error) => setError(e.message));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    if (accounts.length === 0) {
        return (
            <MasterDetailPageLayout>
                <Header>
                    <h1>Accounts</h1>
                </Header>
                <NoIdentities />
            </MasterDetailPageLayout>
        );
    }

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to load Accounts"
                content={error}
                onClick={() => dispatch(push(routes.HOME))}
            />
            {simpleView ? <AccountListPage /> : <AccountDetailsPage />}
        </>
    );
}
