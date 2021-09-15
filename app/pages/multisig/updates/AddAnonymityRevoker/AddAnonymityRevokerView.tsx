import React from 'react';
import { AddAnonymityRevoker } from '~/utils/types';
import { fieldDisplays } from './CreateAddAnonymityRevoker';

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
            <div className="body1">
                <h5 className="mB0">{fieldDisplays.name}</h5>
                {addAnonymityRevoker.arDescription.name}
            </div>
            <div className="body1">
                <h5 className="mB0">{fieldDisplays.url}</h5>
                {addAnonymityRevoker.arDescription.url}
            </div>
            <div className="body1">
                <h5 className="mB0">{fieldDisplays.description}</h5>
                {addAnonymityRevoker.arDescription.description}
            </div>
            <div className="body1">
                <h5 className="mB0">{fieldDisplays.arIdentity}</h5>
                {addAnonymityRevoker.arIdentity}
            </div>
            <div className="body1">
                <h5 className="mB0">{fieldDisplays.arPublicKey}</h5>
                {addAnonymityRevoker.arPublicKey}
            </div>
        </>
    );
}
