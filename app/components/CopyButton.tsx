import React from 'react';
import CopyIcon from '@resources/svg/copy.svg';
import IconButton from '~/cross-app-components/IconButton';

interface Props {
    value: string;
    className?: string;
}

/**
 * Button, that, when pressed, copies the given value into the user's clipboard.
 */
export default function CopyButton({ value, className }: Props): JSX.Element {
    return (
        <IconButton
            className={className}
            onClick={() => navigator.clipboard.writeText(value)}
        >
            <CopyIcon height="20" />
        </IconButton>
    );
}
