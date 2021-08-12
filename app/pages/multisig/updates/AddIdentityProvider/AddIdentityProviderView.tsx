import React, { useState, useEffect } from 'react';
import { AddIdentityProvider } from '~/utils/types';
import { hashSha256 } from '~/utils/serializationHelpers';
import { fieldDisplays } from './CreateAddIdentityProvider';
import { noOp } from '~/utils/basicHelpers';

interface Props {
    addIdentityProvider: AddIdentityProvider;
}

/**
 * Displays an overview of an "Add Identity provider" transaction payload.
 */
export default function AddIdentityProviderView({
    addIdentityProvider,
}: Props) {
    const [hash, setHash] = useState<string>('');

    useEffect(() => {
        hashSha256(Buffer.from(addIdentityProvider.ipVerifyKey, 'hex'))
            .then((h) => setHash(h.toString('hex')))
            .catch(noOp);
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
                <h5 className="mB0">{fieldDisplays.ipVerifyKey} Hash</h5>
                {hash}
            </div>
            <div className="body1">
                <h5 className="mB0">{fieldDisplays.ipVerifyKey}</h5>
                {addIdentityProvider.ipVerifyKey}
            </div>
            <div className="body1">
                <h5 className="mB0">{fieldDisplays.ipCdiVerifyKey}</h5>
                {addIdentityProvider.ipCdiVerifyKey}
            </div>
        </>
    );
}
