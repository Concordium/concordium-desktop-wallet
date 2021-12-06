import { Buffer } from 'buffer/';
import React, { useState, useEffect } from 'react';
import { AddIdentityProvider } from '~/utils/types';
import { hashSha256 } from '~/utils/serializationHelpers';
import { fieldDisplays } from './CreateAddIdentityProvider';
import PublicKeyDetails from '~/components/ledger/PublicKeyDetails';
import DisplayHexString from '~/components/ledger/DisplayHexString';

interface Props {
    addIdentityProvider: AddIdentityProvider;
}

/**
 * Displays an overview of an "Add Identity provider" transaction payload.
 */
export default function AddIdentityProviderView({
    addIdentityProvider,
}: Props) {
    const [ipVerifyKeyHash, setIpVerifyKeyHash] = useState<string>('');

    useEffect(() => {
        setIpVerifyKeyHash(
            hashSha256(
                Buffer.from(addIdentityProvider.ipVerifyKey, 'hex')
            ).toString('hex')
        );
    }, [addIdentityProvider.ipVerifyKey]);

    return (
        <>
            <div className="body1">
                <h5 className="mB0">{fieldDisplays.name}</h5>
                {addIdentityProvider.ipDescription.name}
            </div>
            <div className="body1">
                <h5 className="mB0">{fieldDisplays.url}</h5>
                {addIdentityProvider.ipDescription.url}
            </div>
            <div className="body1">
                <h5 className="mB0">{fieldDisplays.description}</h5>
                {addIdentityProvider.ipDescription.description}
            </div>
            <div className="body1">
                <h5 className="mB0">{fieldDisplays.ipIdentity}</h5>
                {addIdentityProvider.ipIdentity}
            </div>
            <div className="body1">
                <h5 className="mB0">{fieldDisplays.ipVerifyKey}</h5>
                {addIdentityProvider.ipVerifyKey}
            </div>
            <div className="body1">
                <h5 className="mB0">{fieldDisplays.ipVerifyKey} Hash</h5>
                <DisplayHexString value={ipVerifyKeyHash} />
            </div>
            <div className="body1">
                <h5 className="mB0">{fieldDisplays.ipCdiVerifyKey}</h5>
                <PublicKeyDetails
                    publicKey={addIdentityProvider.ipCdiVerifyKey}
                />
            </div>
        </>
    );
}
