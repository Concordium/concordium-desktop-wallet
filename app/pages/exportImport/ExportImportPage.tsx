import React from 'react';
import { Grid, Segment } from 'semantic-ui-react';
import PageLayout from '../../components/PageLayout';
import Export from './Export';
import Import from './Import';

export default function ExportImportPage() {
    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Export and Import</h1>
            </PageLayout.Header>
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
        </PageLayout>
    );
}
