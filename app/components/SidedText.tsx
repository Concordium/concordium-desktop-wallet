import React from 'react';
import { Grid } from 'semantic-ui-react';

interface Props {
    left: string;
    right: string;
}

/**
 * Helper component to display two strings in a grid,
 * each aligned by their respective side.
 */
export default function sidedText({ left, right }: Props) {
    return (
        <Grid.Row>
            <Grid.Column textAlign="left">{left}</Grid.Column>
            <Grid.Column textAlign="right">{right}</Grid.Column>
        </Grid.Row>
    );
}
