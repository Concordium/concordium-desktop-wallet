import React from 'react';
import ExportBakerCredentials from '~/components/ExportBakerCredentials';
import { MakeOptional, PropsOf } from '~/utils/types';

type Props = MakeOptional<
    Omit<PropsOf<typeof ExportBakerCredentials>, 'children'>,
    'accountAddress' | 'bakerKeys'
>;

export default function ExportBakerKeys({ accountAddress, ...props }: Props) {
    if (!accountAddress) {
        return null;
    }

    return (
        <ExportBakerCredentials accountAddress={accountAddress} {...props} />
    );
}
