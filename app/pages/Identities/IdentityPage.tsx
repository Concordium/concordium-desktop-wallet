import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import PlusIcon from '@resources/svg/plus.svg';
import IdentityList from './IdentityList';
import IdentityView from './IdentityView';
import NoIdentities from '~/components/NoIdentities';
import { identitiesSelector } from '~/features/IdentitySlice';
import routes from '~/constants/routes.json';

import PageLayout from '~/components/PageLayout';
import MasterDetailPageLayout from '~/components/MasterDetailPageLayout';

const { Header, Master, Detail } = MasterDetailPageLayout;

export default function IdentityPage() {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);

    const header = (
        <Header>
            <h1>Identities</h1>
            <PageLayout.HeaderButton
                align="right"
                onClick={() => dispatch(push(routes.IDENTITYISSUANCE))}
            >
                <PlusIcon height="20" />
            </PageLayout.HeaderButton>
        </Header>
    );

    if (identities.length === 0) {
        return (
            <MasterDetailPageLayout>
                {header}
                <NoIdentities />
            </MasterDetailPageLayout>
        );
    }

    return (
        <MasterDetailPageLayout>
            {header}
            <Master>
                <IdentityList />
            </Master>
            <Detail>
                <IdentityView />
            </Detail>
        </MasterDetailPageLayout>
    );
}
