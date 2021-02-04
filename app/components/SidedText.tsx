import React from 'react';
import { Grid } from 'semantic-ui-react';

interface Props {
    left: string;
    right: string;
    onClick?(e: Event): void;
}

/**
 * Helper component to display two strings in a grid,
 * each aligned by their respective side.
 */
function sidedText({ left, right, onClick }: Props) {
    return (
        <Grid.Row onClick={onClick}>
            <Grid.Column textAlign="left">{left}</Grid.Column>
            <Grid.Column textAlign="right">{right}</Grid.Column>
        </Grid.Row>
    );
}

sidedText.defaultProps = {
    onClick: () => {},
};

export default sidedText;
