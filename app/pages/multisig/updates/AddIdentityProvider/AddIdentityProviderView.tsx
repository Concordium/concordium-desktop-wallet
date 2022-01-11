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
            <div>
                <h5 className="mB5">{fieldDisplays.name}:</h5>
                <span className="mono body3">
                    {addIdentityProvider.ipDescription.name}
                </span>
            </div>
            <div>
                <h5 className="mB5">{fieldDisplays.url}:</h5>
                <span className="mono body3">
                    {addIdentityProvider.ipDescription.url}
                </span>
            </div>
            <div>
                <h5 className="mB5">{fieldDisplays.description}:</h5>
                <span className="mono body3">
                    {addIdentityProvider.ipDescription.description}
                </span>
            </div>
            <div>
                <h5 className="mB5">{fieldDisplays.ipIdentity}:</h5>
                <span className="mono body3">
                    {addIdentityProvider.ipIdentity}
                </span>
            </div>
            <div>
                <h5 className="mB5">{fieldDisplays.ipVerifyKey}:</h5>
                <span className="mono body3">
                    {addIdentityProvider.ipVerifyKey}
                </span>
            </div>
            <div>
                <h5 className="mB5">{fieldDisplays.ipVerifyKey} hash:</h5>
                <span className="mono body3">
                    <DisplayHexString value={ipVerifyKeyHash} />
                </span>
            </div>
            <div>
                <h5 className="mB5">{fieldDisplays.ipCdiVerifyKey}:</h5>
                <span className="mono body3">
                    <PublicKeyDetails
                        publicKey={addIdentityProvider.ipCdiVerifyKey}
                    />
                </span>
            </div>
        </>
    );
}
