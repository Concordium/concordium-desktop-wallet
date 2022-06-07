import React from 'react';
import { AddAnonymityRevoker } from '~/utils/types';
import { fieldDisplays } from './CreateAddAnonymityRevoker';
import PublicKeyDetails from '~/components/ledger/PublicKeyDetails';

interface Props {
    addAnonymityRevoker: AddAnonymityRevoker;
}

/**
 * Displays an overview of an addAnonymityRevoker transaction payload.
 */
export default function AddAnonymityRevokerView({
    addAnonymityRevoker,
}: Props) {
    return (
        <>
            <div>
                <h5 className="mB5">{fieldDisplays.name}:</h5>
                <span className="mono body3">
                    {addAnonymityRevoker.arDescription.name}
                </span>
            </div>
            <div>
                <h5 className="mB5">{fieldDisplays.url}:</h5>
                <span className="mono body3">
                    {addAnonymityRevoker.arDescription.url}
                </span>
            </div>
            <div>
                <h5 className="mB5">{fieldDisplays.description}:</h5>
                <span className="mono body3">
                    {addAnonymityRevoker.arDescription.description}
                </span>
            </div>
            <div>
                <h5 className="mB5">{fieldDisplays.arIdentity}:</h5>
                <span className="mono body3">
                    {addAnonymityRevoker.arIdentity}
                </span>
            </div>
            <div>
                <h5 className="mB5">{fieldDisplays.arPublicKey}:</h5>
                <span className="mono body3">
                    <PublicKeyDetails
                        publicKey={addAnonymityRevoker.arPublicKey}
                    />
                </span>
            </div>
        </>
    );
}
