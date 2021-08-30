/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { chunkString } from '~/utils/basicHelpers';

interface Props {
    value: string;
    lineLength?: number;
}

export default function DisplayHexString({ value, lineLength = 16 }: Props) {
    return (
        <div className="textCenter mV40">
            {chunkString(value, lineLength).map((text) => (
                <p className="m0" key={text}>
                    {text}
                </p>
            ))}
        </div>
    );
}
