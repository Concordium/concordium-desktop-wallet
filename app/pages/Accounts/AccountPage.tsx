import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Dispatch } from '@reduxjs/toolkit';
import NoIdentities from '~/components/NoIdentities';
import {
    accountsSelector,
    loadAccountInfos,
    loadAccounts,
} from '~/features/AccountSlice';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import { RootState } from '~/store/store';
import SimpleErrorModal from '~/components/SimpleErrorModal';

import AccountListPage from './AccountListPage';
import AccountDetailsPage from './AccountDetailsPage';
import useThunkDispatch from '~/store/useThunkDispatch';
import { accountInfoFailedMessage } from './useAccountSync';

const { Header } = MasterDetailPageLayout;

async function handleLoad(dispatch: Dispatch) {
    const accounts = await loadAccounts(dispatch);
    try {
        await loadAccountInfos(accounts, dispatch);
    } catch (e) {
        throw new Error(accountInfoFailedMessage(e.message));
    }
}

export default function AccountsPage() {
    const dispatch = useThunkDispatch();
    const accounts = useSelector(accountsSelector);
    const simpleView = useSelector((s: RootState) => s.accounts.simpleView);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        handleLoad(dispatch).catch((e: Error) => setError(e.message));
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

    const Page = simpleView ? AccountListPage : AccountDetailsPage;

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to load account information"
                content={error}
                onClick={() => setError(undefined)}
            />
            <Page onError={setError} />
        </>
    );
}
