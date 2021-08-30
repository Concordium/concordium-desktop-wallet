import { push } from 'connected-react-router';
import React from 'react';
import { useDispatch } from 'react-redux';

import PlusIcon from '@resources/svg/plus.svg';
import routes from '~/constants/routes.json';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import PageLayout from '~/components/PageLayout';

import AccountPageHeader from '../AccountPageHeader';

const { Header, Master, Detail } = MasterDetailPageLayout;

export default function DetailsPage() {
    const dispatch = useDispatch();

    return (
        <MasterDetailPageLayout>
            <Header>
                <AccountPageHeader />
                <PageLayout.HeaderButton
                    align="right"
                    onClick={() => dispatch(push(routes.ACCOUNTCREATION))}
                >
                    <PlusIcon height="20" />
                </PageLayout.HeaderButton>
            </Header>
            <Master>...</Master>
            <Detail>...</Detail>
        </MasterDetailPageLayout>
    );
}
