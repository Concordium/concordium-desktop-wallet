import React, { useEffect, useState } from 'react';
import { Buffer } from 'buffer/';
import Label from '~/components/Label';
import { ProtocolUpdate } from '~/utils/types';

interface Props {
    protocolUpdate: ProtocolUpdate;
}

/**
 * Displays an overview of a protocol update transaction payload.
 */
export default function ProtocolUpdateView({ protocolUpdate }: Props) {
    const [auxiliaryDataHash, setAuxiliaryDataHash] = useState<string>();

    useEffect(() => {
        if (protocolUpdate.specificationAuxiliaryData) {
            const auxiliaryData = Buffer.from(
                protocolUpdate.specificationAuxiliaryData,
                'base64'
            );
            const hash = Buffer.from(
                window.cryptoMethods.sha256([auxiliaryData])
            );
            setAuxiliaryDataHash(hash.toString('hex'));
        }
    }, [protocolUpdate.specificationAuxiliaryData]);

    return (
        <>
            <div>
                <Label className="mB5">Message:</Label>
                <div className="body3 mono">{protocolUpdate.message}</div>
            </div>
            <div>
                <Label className="mB5">Specification URL:</Label>
                <div className="body3 mono">
                    {protocolUpdate.specificationUrl}
                </div>
            </div>
            <div>
                <Label className="mB5">Specification hash:</Label>
                <div className="body3 mono">
                    {protocolUpdate.specificationHash}
                </div>
            </div>
            <div>
                <Label className="mB5">
                    Specification auxiliary data hash:
                </Label>
                <div className="body3 mono">
                    {auxiliaryDataHash || 'No auxiliary data was attached'}
                </div>
            </div>
        </>
    );
}
