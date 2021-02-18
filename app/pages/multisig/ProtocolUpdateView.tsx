import React from 'react';
import { Segment } from 'semantic-ui-react';
import { ProtocolUpdate } from '../../utils/types';

interface Props {
    protocolUpdate: ProtocolUpdate;
}

/**
 * Displays an overview of a protocol update transaction payload.
 */
export default function ProtocolUpdateView({ protocolUpdate }: Props) {
    return <Segment basic>{protocolUpdate.message}</Segment>;
}
