import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Dispatch } from '@reduxjs/toolkit';
import NoIdentities from '~/components/NoIdentities';
import {
    accountsSelector,
    chosenAccountSelector,
    loadAccountInfos,
    loadAccounts,
} from '~/features/AccountSlice';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import { RootState } from '~/store/store';
import SimpleErrorModal from '~/components/SimpleErrorModal';

import useAccountSync from './useAccountSync';
import AccountListPage from './AccountListPage';
import AccountDetailsPage from './AccountDetailsPage';
import useThunkDispatch from '~/store/useThunkDispatch';

const { Header } = MasterDetailPageLayout;

interface Props {
    onError(message: string): void;
}

function AccountsPageComponent({ onError }: Props) {
    const accounts = useSelector(accountsSelector);
    useAccountSync(onError);
    const simpleView = useSelector((s: RootState) => s.accounts.simpleView);

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

    return simpleView ? <AccountListPage /> : <AccountDetailsPage />;
}

async function handleLoad(dispatch: Dispatch) {
    const accounts = await loadAccounts(dispatch);
    return loadAccountInfos(accounts, dispatch);
}

export default function AccountsPage() {
    const dispatch = useThunkDispatch();
    const account = useSelector(chosenAccountSelector);
    const [error, setError] = useState<string | undefined>();

    const ReloadWrapper: typeof AccountsPageComponent = useCallback(
        (props) => {
            return <AccountsPageComponent {...props} />;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [account?.address]
    );

    useEffect(() => {
        handleLoad(dispatch).catch((e: Error) => setError(e.message));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to update accounts"
                content={error}
                onClick={() => setError(undefined)}
            />
            <ReloadWrapper onError={setError} />
        </>
    );
}
