import React from 'react';

interface Props {
    value: string;
}

export default function CopyButton({ value }: Props): JSX.element {
    return (
        <button
            type="button"
            onClick={() => navigator.clipboard.writeText(value)}
        >
            copy
        </button>
    );
}
