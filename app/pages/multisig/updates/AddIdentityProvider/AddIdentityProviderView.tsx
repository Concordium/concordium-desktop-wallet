import React from 'react';
import { AddIdentityProvider } from '~/utils/types';

interface Props {
    addIdentityProvider: AddIdentityProvider;
}

/**
 * Displays an overview of a add Identity provider transaction payload.
 */
export default function AddIdentityProviderView({
    addIdentityProvider,
}: Props) {
    return (
        <>
            <div className="body1">
                <h5 className="mB0">Name</h5>
                {addIdentityProvider.ipDescription.name}
            </div>
            <div className="body1">
                <h5 className="mB0">Name</h5>
                {addIdentityProvider.ipDescription.url}
            </div>
            <div className="body1">
                <h5 className="mB0">Name</h5>
                {addIdentityProvider.ipDescription.description}
            </div>
            <div className="body1">
                <h5 className="mB0">IpIdentity</h5>
                {addIdentityProvider.ipIdentity}
            </div>
            <div className="body1">
                <h5 className="mB0">VerifyKey</h5>
                {addIdentityProvider.ipVerifyKey}
            </div>
            <div className="body1">
                <h5 className="mB0">CdiVerifyKey</h5>
                {addIdentityProvider.ipCdiVerifyKey}
            </div>
        </>
    );
}
