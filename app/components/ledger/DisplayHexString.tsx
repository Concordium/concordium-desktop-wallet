/* eslint-disable react/destructuring-assignment */
import React from 'react';
import clsx from 'clsx';
import { chunkString } from '~/utils/basicHelpers';

interface Props {
    value: string;
    lineLength?: number;
    className?: string;
}

export default function DisplayHexString({
    value,
    className,
    lineLength = 16,
}: Props) {
    return (
        <div className={clsx('textCenter mono', className)}>
            {chunkString(value, lineLength).map((text, i) => (
                <div
                    className={clsx(
                        (i + 1) % 3 === 0 ? 'm0 mB5' : 'm0' // matches display on ledger nanos+
                    )}
                    key={text}
                >
                    {text}
                </div>
            ))}
        </div>
    );
}
