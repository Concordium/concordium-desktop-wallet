/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { chunkString } from '~/utils/basicHelpers';

interface Props {
    publicKey: string;
}

const lineLength = 16;

export default function PublicKeyDetails({ publicKey }: Props) {
    return (
        <div className="textCenter mV40">
            {chunkString(publicKey, lineLength).map((text) => (
                <p className="m0" key={text}>
                    {text}
                </p>
            ))}
        </div>
    );
}
