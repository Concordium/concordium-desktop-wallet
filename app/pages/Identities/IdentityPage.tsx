import React from 'react';
import { Grid } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import IdentityList from './IdentityList';
import IdentityView from './IdentityView';
import NoIdentities from '../../components/NoIdentities';
import { identitiesSelector } from '../../features/IdentitySlice';

export default function IdentityPage() {
    const identities = useSelector(identitiesSelector);
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
}
