import React from 'react';
import { useSelector } from 'react-redux';

import NoIdentities from '~/components/NoIdentities';
import { accountsSelector } from '~/features/AccountSlice';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import { RootState } from '~/store/store';
import SimpleErrorModal from '~/components/SimpleErrorModal';

import useAccountSync from './useAccountSync';
import AccountListPage from './AccountListPage';
import AccountDetailsPage from './AccountDetailsPage';

const { Header } = MasterDetailPageLayout;

export default function AccountsPage() {
    const accounts = useSelector(accountsSelector);
    const { error, clearError } = useAccountSync();
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

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to update accounts"
                content={error}
                onClick={clearError}
            />
            {simpleView ? <AccountListPage /> : <AccountDetailsPage />}
        </>
    );
}
