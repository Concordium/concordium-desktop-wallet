/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { chunkString } from '~/utils/basicHelpers';

interface Props {
    publickey: string;
}

const firstLineLength = 18;
const lineLength = 18;

export default function PublicKeyDetails({ publickey }: Props) {
    const firstLine = publickey.substring(0, firstLineLength);

    return (
        <div className="textCenter mV40">
            <p>{firstLine}</p>
            {chunkString(publickey.substring(firstLineLength), lineLength).map(
                (text) => (
                    <p key={text}>{text}</p>
                )
            )}
        </div>
    );
}
