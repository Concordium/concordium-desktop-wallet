import React from 'react';
import { useSelector } from 'react-redux';
import NoIdentities from '~/components/NoIdentities';
import { accountsSelector } from '~/features/AccountSlice';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import useAccountSync from './useAccountSync';
import AccountListPage from './AccountListPage';
import AccountDetailsPage from './AccountDetailsPage';

const { Header } = MasterDetailPageLayout;

export default function AccountsPage() {
    const accounts = useSelector(accountsSelector);
    useAccountSync();
    const simpleView = true;

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

    if (simpleView) {
        return <AccountListPage />;
    }

    return <AccountDetailsPage />;
}
