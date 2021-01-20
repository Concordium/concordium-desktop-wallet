import React from 'react';
import { Button } from 'semantic-ui-react';

interface Props {
    value: string;
}

export default function CopyButton({ value }: Props): JSX.element {
    return (
        <Button onClick={() => navigator.clipboard.writeText(value)}>
            copy
        </Button>
    );
}
