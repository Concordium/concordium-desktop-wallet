import React, { useMemo } from 'react';
import { Grid } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import IdentityList from './IdentityList';
import IdentityView from './IdentityView';
import NoIdentities from '../../components/NoIdentities';
import { identitiesSelector } from '../../features/IdentitySlice';
import PageHeader from '../../components/PageHeader';
import routes from '../../constants/routes.json';

import PlusIcon from '../../../resources/svg/plus.svg';

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
        <>
            <PageHeader>
                <h1>Identities</h1>
                <PageHeader.Button
                    align="right"
                    onClick={() => dispatch(push(routes.IDENTITYISSUANCE))}
                >
                    <PlusIcon />
                </PageHeader.Button>
            </PageHeader>
            {body}
        </>
    );
}
