import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';

import NoIdentities from '~/components/NoIdentities';
import { accountsSelector } from '~/features/AccountSlice';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import { RootState } from '~/store/store';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import routes from '~/constants/routes.json';

import useAccountSync from './useAccountSync';
import AccountListPage from './AccountListPage';
import AccountDetailsPage from './AccountDetailsPage';

const { Header } = MasterDetailPageLayout;

export default function AccountsPage() {
    const accounts = useSelector(accountsSelector);
    const dispatch = useDispatch();
    const syncError = useAccountSync();
    const { simpleView } = useSelector((s: RootState) => s.accounts);

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
                show={Boolean(syncError)}
                header="Unable to update accounts"
                content={syncError}
                onClick={() => dispatch(push(routes.HOME))}
            />
            {simpleView ? <AccountListPage /> : <AccountDetailsPage />}
        </>
    );
}
