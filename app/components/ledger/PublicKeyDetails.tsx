/* eslint-disable react/destructuring-assignment */
import React from 'react';
import DisplayHexString from './DisplayHexString';

interface Props {
    publicKey: string;
}

const lineLength = 16;

export default function PublicKeyDetails({ publicKey }: Props) {
    return <DisplayHexString value={publicKey} lineLength={lineLength} />;
}
