import React from 'react';

import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';

import AccountPageLayout from '../AccountPageLayout';

const { Master, Detail } = MasterDetailPageLayout;

export default function DetailsPage() {
    return (
        <AccountPageLayout>
            <Master>...</Master>
            <Detail>...</Detail>
        </AccountPageLayout>
    );
}
