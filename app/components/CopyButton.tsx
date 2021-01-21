import React from 'react';
import { Button } from 'semantic-ui-react';

interface Props {
    value: string;
}

/**
 * Button, that, when pressed, copies the given value into the user's clipboard.
 */
export default function CopyButton({ value }: Props): JSX.element {
    return (
        <Button onClick={() => navigator.clipboard.writeText(value)}>
            copy
        </Button>
    );
}
