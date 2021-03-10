import React, { PropsWithChildren } from 'react';
import { useKeyPress } from '../util/eventHooks';

interface DetectKeyPressProps {
    /**
     * Handler for keypresses.
     */
    onKeyPress(e: KeyboardEvent): void;
}

/**
 * @description
 * Component for detecting keypresses while component is rendered. Automatically removes event listener on unmount.
 *
 * @example
 * <DetectKeyPress onKeyPress={handleKeyPress}>
 *   Detect key press while rendered
 * </DetectKeyPress>
 */
export default function DetectKeyPress({
    onKeyPress,
    children,
}: PropsWithChildren<DetectKeyPressProps>): JSX.Element {
    useKeyPress(onKeyPress);
    return <>{children}</>;
}
