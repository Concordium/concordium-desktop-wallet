import React from 'react';
import { Grid, Segment } from 'semantic-ui-react';
import Export from '../components/Export';
import Import from '../components/Import';

export default function ImportExportPage() {
    return (
        <Segment>
            <Grid centered columns="equal" divided>
                <Grid.Row>
                    <Grid.Column>
                        <Export />
                    </Grid.Column>
                    <Grid.Column>
                        <Import />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>
    );
}
