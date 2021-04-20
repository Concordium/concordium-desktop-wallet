import React from 'react';
import BackIcon from '@resources/svg/back-arrow.svg';
import IconButton, { IconButtonProps } from '../IconButton';

type BackButtonProps = Omit<IconButtonProps, 'type' | 'title' | 'children'>;

export default function BackButton(props: BackButtonProps): JSX.Element {
    return (
        <IconButton type="button" title="back" {...props}>
            <BackIcon height="21" />
        </IconButton>
    );
}
