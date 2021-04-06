import React from 'react';
import { useSelector } from 'react-redux';
import { Identity } from '~/utils/types';
import { createCredentialInfo } from '~/utils/rustInterface';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import { getNextCredentialNumber } from '~/database/CredentialDao';
import { globalSelector } from '~/features/GlobalSlice';
import { CredentialBlob } from './types';

interface Props {
    identity: Identity | undefined;
    address: string;
    attributes: string[];
    setReady: (ready: boolean) => void;
    setCredential: (cred: CredentialBlob) => void;
}

/**
 * Creates the credentialInformation, and prompts the user to sign it.
 */
export default function SignCredential({
    identity,
    address,
    setCredential,
    setReady,
    attributes,
}: Props): JSX.Element {
    const global = useSelector(globalSelector);

    async function sign(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        if (!identity || !global) {
            throw new Error('unexpected missing identity/global');
        }

        const credentialNumber = await getNextCredentialNumber(identity.id);

        const credential = await createCredentialInfo(
            identity,
            credentialNumber,
            global,
            attributes,
            setMessage,
            ledger,
            address
        );
        setCredential({
            credential,
            address,
            credentialNumber,
            identityId: identity.id,
        });
        setMessage('Credential generated succesfully!');
        setReady(true);
    }

    return <SimpleLedger ledgerCall={sign} />;
}
