import React from 'react';
import { Grid } from 'semantic-ui-react';
import IdentityList from './IdentityList';
import IdentityView from './IdentityView';

export default function IdentityPage() {
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
