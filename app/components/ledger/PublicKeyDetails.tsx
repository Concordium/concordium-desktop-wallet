/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { chunkString } from '~/utils/basicHelpers';

interface Props {
    publickey: string;
}

const lineLength = 18;

export default function PublicKeyDetails({ publickey }: Props) {
    return (
        <div className="textCenter mV40">
            {chunkString(publickey, lineLength).map((text) => (
                <p className="m0" key={text}>
                    {text}
                </p>
            ))}
        </div>
    );
}
