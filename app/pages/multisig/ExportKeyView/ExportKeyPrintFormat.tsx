import React from 'react';
import { ExportKeyType, PublicKeyExportFormat } from '~/utils/types';
import PublicKeyDetails from '~/components/ledger/PublicKeyDetails';

export interface PrintFormatProps {
    publicKeyExport: PublicKeyExportFormat;
    image: string;
}

/**
 * Constructs a printable version of the PublicKeyExportFormat.
 * @param publicKeyExport the public-key export to get in a printable format
 * @param image the image dataURL for the identicon image of the public-key
 */
export default function PrintFormat({
    publicKeyExport,
    image,
}: PrintFormatProps) {
    let keyTypeText;
    if (ExportKeyType.Root === publicKeyExport.type) {
        keyTypeText = 'Governance root key';
    } else if (ExportKeyType.Level1 === publicKeyExport.type) {
        keyTypeText = 'Governance level 1 key';
    } else if (ExportKeyType.Level2 === publicKeyExport.type) {
        keyTypeText = 'Governance level 2 key';
    } else {
        throw new Error('Invalid key type being exported.');
    }

    return (
        <div>
            <h2>{keyTypeText}</h2>
            <h3>Public-key</h3>
            <PublicKeyDetails publicKey={publicKeyExport.key.verifyKey} />
            <h3>Identicon</h3>
            <img src={image} alt="" />
            <h3>Note</h3>
            <p>{publicKeyExport.note || 'No note was supplied.'}</p>
        </div>
    );
}
