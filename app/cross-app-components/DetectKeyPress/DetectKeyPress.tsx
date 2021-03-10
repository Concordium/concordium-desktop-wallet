import React, { PropsWithChildren } from 'react';
import { useKeyPress } from '../util/eventHooks';

interface DetectKeyPressProps {
    onKeyPress(e: KeyboardEvent): void;
}

export default function DetectKeyPress({
    onKeyPress,
    children,
}: PropsWithChildren<DetectKeyPressProps>): JSX.Element {
    useKeyPress(onKeyPress);
    return <>{children}</>;
}
