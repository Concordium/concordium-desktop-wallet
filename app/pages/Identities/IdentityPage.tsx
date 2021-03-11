import React, { useMemo } from 'react';
import { Grid } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import IdentityList from './IdentityList';
import IdentityView from './IdentityView';
import NoIdentities from '../../components/NoIdentities';
import { identitiesSelector } from '../../features/IdentitySlice';
import routes from '../../constants/routes.json';

import PlusIcon from '../../../resources/svg/plus.svg';
import PageLayout from '../../components/PageLayout';

export default function IdentityPage() {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);

    const body = useMemo(() => {
        if (identities.length === 0) {
            return <NoIdentities />;
        }

        return (
            <Grid centered columns="equal" divided>
                <Grid.Row>
                    <Grid.Column>
                        <IdentityList />
                    </Grid.Column>
                    <Grid.Column>
                        <IdentityView />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }, [identities]);

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Identities</h1>
                <PageLayout.HeaderButton
                    align="right"
                    onClick={() => dispatch(push(routes.IDENTITYISSUANCE))}
                >
                    <PlusIcon />
                </PageLayout.HeaderButton>
            </PageLayout.Header>
            {body}
        </PageLayout>
    );
}
