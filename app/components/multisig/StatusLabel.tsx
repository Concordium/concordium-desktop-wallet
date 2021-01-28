import React from 'react';
import { Label } from 'semantic-ui-react';
import { MultiSignatureTransactionStatus } from '../../utils/types';

type ColorType =
    | 'blue'
    | 'olive'
    | 'green'
    | 'red'
    | 'grey'
    | 'orange'
    | 'yellow'
    | 'teal'
    | 'violet'
    | 'purple'
    | 'pink'
    | 'brown'
    | 'black'
    | undefined;

interface Props {
    status: MultiSignatureTransactionStatus;
}

const statusColorMap = new Map<MultiSignatureTransactionStatus, ColorType>([
    [MultiSignatureTransactionStatus.Open, 'blue'],
    [MultiSignatureTransactionStatus.Submitted, 'olive'],
    [MultiSignatureTransactionStatus.Finalized, 'green'],
    [MultiSignatureTransactionStatus.Failed, 'red'],
]);

/**
 * Component that displays a label with a color corresponding to the supplied status.
 */
export default function StatusLabel({ status }: Props) {
    return (
        <Label color={statusColorMap.get(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Label>
    );
}
