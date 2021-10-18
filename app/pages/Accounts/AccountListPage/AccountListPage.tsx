import React from 'react';

import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';

import AccountList from './AccountList';
import AccountView from './AccountView';
import AccountPageLayout from '../AccountPageLayout';
import { AccountSyncProps } from '../withAccountSync';

const { Master, Detail } = MasterDetailPageLayout;

export default function ListPage(props: AccountSyncProps) {
    return (
        <AccountPageLayout>
            <Master>
                <AccountList />
            </Master>
            <Detail>
                <AccountView {...props} />
            </Detail>
        </AccountPageLayout>
    );
}
