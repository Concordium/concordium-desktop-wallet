import React from 'react';
import ExportBakerCredentials from '~/components/ExportBakerCredentials';
import { MakeOptional, PropsOf } from '~/utils/types';

type Props = MakeOptional<
    Omit<PropsOf<typeof ExportBakerCredentials>, 'children'>,
    'accountAddress' | 'bakerKeys'
>;

export default function ExportBakerKeys({
    accountAddress,
    bakerKeys,
    ...props
}: Props) {
    if (!accountAddress) {
        return null;
    }

    if (!bakerKeys) {
        return <p>Generating keys...</p>;
    }

    return (
        <ExportBakerCredentials
            accountAddress={accountAddress}
            bakerKeys={bakerKeys}
            {...props}
        />
    );
}
