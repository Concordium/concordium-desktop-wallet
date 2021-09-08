/* eslint-disable react/destructuring-assignment */
import React from 'react';
import clsx from 'clsx';
import { chunkString } from '~/utils/basicHelpers';

interface Props {
    address: string;
    lineClassName?: string;
    outerClassName?: string;
    lineLength?: number;
}

export default function DisplayAddress({
    address,
    lineClassName,
    outerClassName,
    lineLength = 10,
}: Props) {
    return (
        <div className={clsx(outerClassName, 'textCenter mono')}>
            {chunkString(address, lineLength).map((text) => (
                <p className={clsx(lineClassName, 'm0')} key={text}>
                    {text}
                </p>
            ))}
        </div>
    );
}
