import React from 'react';

import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';

import AccountList from '../AccountList';
import AccountView from './AccountView';
import AccountPageLayout from '../AccountPageLayout';

const { Master, Detail } = MasterDetailPageLayout;

export default function ListPage() {
    return (
        <AccountPageLayout>
            <Master>
                <AccountList />
            </Master>
            <Detail>
                <AccountView />
            </Detail>
        </AccountPageLayout>
    );
}
