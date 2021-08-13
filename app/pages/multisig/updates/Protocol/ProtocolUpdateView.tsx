import React, { useEffect, useState } from 'react';
import { ProtocolUpdate } from '~/utils/types';

interface Props {
    protocolUpdate: ProtocolUpdate;
}

/**
 * Displays an overview of a protocol update transaction payload.
 */
export default function ProtocolUpdateView({ protocolUpdate }: Props) {
    const [auxiliaryDataHash, setAuxiliaryDataHash] = useState<string>();
    const auxiliaryData = Buffer.from(
        protocolUpdate.specificationAuxiliaryData,
        'base64'
    );

    useEffect(() => {
        const hash = window.cryptoMethods.sha256([auxiliaryData]);
        setAuxiliaryDataHash(hash.toString('hex'));
    }, [auxiliaryData]);

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
                {auxiliaryDataHash}
            </div>
        </>
    );
}
