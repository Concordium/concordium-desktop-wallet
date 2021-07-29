import React from 'react';
import { AddAnonymityRevoker } from '~/utils/types';

interface Props {
    addAnonymityRevoker: AddAnonymityRevoker;
}

/**
 * Displays an overview of a add Identity provider transaction payload.
 */
export default function AddAnonymityRevokerView({
    addAnonymityRevoker,
}: Props) {
    return (
        <>
            <div className="body1">
                <h5 className="mB0">Name</h5>
                {addAnonymityRevoker.arDescription.name}
            </div>
            <div className="body1">
                <h5 className="mB0">URL</h5>
                {addAnonymityRevoker.arDescription.url}
            </div>
            <div className="body1">
                <h5 className="mB0">Description</h5>
                {addAnonymityRevoker.arDescription.description}
            </div>
            <div className="body1">
                <h5 className="mB0">arIdentity</h5>
                {addAnonymityRevoker.arIdentity}
            </div>
            <div className="body1">
                <h5 className="mB0">Public Key</h5>
                {addAnonymityRevoker.arPublicKey}
            </div>
        </>
    );
}
