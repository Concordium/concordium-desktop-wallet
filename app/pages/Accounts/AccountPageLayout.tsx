import { push } from 'connected-react-router';
import React, { ReactElement } from 'react';
import { useDispatch } from 'react-redux';

import PlusIcon from '@resources/svg/plus.svg';
import routes from '~/constants/routes.json';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';
import PageLayout from '~/components/PageLayout';

import AccountPageHeader from './AccountPageHeader';
import ChangeView from './ChangeView';

const { Header } = MasterDetailPageLayout;

interface Props {
    children: [ReactElement, ReactElement];
}

export default function AccountPageLayout({ children }: Props) {
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
                <ChangeView />
            </Header>
            {children[0]}
            {children[1]}
        </MasterDetailPageLayout>
    );
}
