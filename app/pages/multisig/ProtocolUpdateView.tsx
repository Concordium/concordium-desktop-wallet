import React from 'react';
import { Header } from 'semantic-ui-react';
import { hashSha256 } from '../../utils/serializationHelpers';
import { ProtocolUpdate } from '../../utils/types';

interface Props {
    protocolUpdate: ProtocolUpdate;
}

/**
 * Displays an overview of a protocol update transaction payload.
 */
export default function ProtocolUpdateView({ protocolUpdate }: Props) {
    return (
        <>
            <Header>Message</Header>
            {protocolUpdate.message}
            <Header>Specification URL</Header>
            {protocolUpdate.specificationUrl}
            <Header>Specification hash</Header>
            {protocolUpdate.specificationHash.toString('hex')}
            <Header>Specification auxiliary data hash</Header>
            {hashSha256(protocolUpdate.specificationAuxiliaryData).toString(
                'hex'
            )}
        </>
    );
}
