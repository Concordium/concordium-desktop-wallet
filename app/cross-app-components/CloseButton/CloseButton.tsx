import React from 'react';
import CloseIcon from '@resources/svg/cross.svg';
import IconButton, { IconButtonProps } from '../IconButton';

type CloseButtonProps = Omit<IconButtonProps, 'type' | 'title' | 'children'>;

export default function CloseButton(props: CloseButtonProps): JSX.Element {
    return (
        <IconButton type="button" title="close" {...props}>
            <CloseIcon width="20" />
        </IconButton>
    );
}
