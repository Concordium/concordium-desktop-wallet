import React from 'react';
import { hashSha256 } from '~/utils/serializationHelpers';
import { ProtocolUpdate } from '~/utils/types';

interface Props {
    protocolUpdate: ProtocolUpdate;
}

/**
 * Displays an overview of a protocol update transaction payload.
 */
export default function ProtocolUpdateView({ protocolUpdate }: Props) {
    const auxiliaryData = Buffer.from(
        protocolUpdate.specificationAuxiliaryData,
        'base64'
    );

    return (
        <>
            <div className="body1">
                <h5 className="mB0">Message</h5>
                {protocolUpdate.message}
            </div>
            <div className="body1">
                <h5 className="mB0">Specification URL</h5>
                {protocolUpdate.specificationUrl}
            </div>
            <div className="body1">
                <h5 className="mB0">Specification hash</h5>
                {protocolUpdate.specificationHash}
            </div>
            <div className="body2">
                <h5 className="mB0">Specification auxiliary data hash</h5>
                {hashSha256(auxiliaryData).toString('hex')}
            </div>
        </>
    );
}
