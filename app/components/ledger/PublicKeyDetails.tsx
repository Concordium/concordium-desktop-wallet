/* eslint-disable react/destructuring-assignment */
import React from 'react';
import DisplayHexString from './DisplayHexString';

interface Props {
    className?: string;
    publicKey: string;
}

const lineLength = 16;

export default function PublicKeyDetails({ className, publicKey }: Props) {
    return (
        <DisplayHexString
            className={className}
            value={publicKey}
            lineLength={lineLength}
        />
    );
}
