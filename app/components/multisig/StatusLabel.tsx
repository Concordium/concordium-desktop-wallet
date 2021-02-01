import React from 'react';
import { Label } from 'semantic-ui-react';
import { ColorType } from '../../utils/types';

interface Props<T extends string> {
    status: T;
    colorMap: Map<T, ColorType>;
}

/**
 * Component that displays a label with a color corresponding to the supplied status.
 */
export default function StatusLabel<T extends string>({
    status,
    colorMap,
}: Props<T>) {
    return (
        <Label color={colorMap.get(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Label>
    );
}
