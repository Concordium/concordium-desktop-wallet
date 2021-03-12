import React from 'react';
import { useSelector } from 'react-redux';
import { Identity, CredentialDeploymentInformation } from '../../utils/types';
import { createCredentialInfo } from '../../utils/rustInterface';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import LedgerComponent from '../../components/ledger/LedgerComponent';
import { getNextCredentialNumber } from '../../database/CredentialDao';
import { insertNewCredential } from '../../features/CredentialSlice';
import { globalSelector } from '../../features/GlobalSlice';
import { serializeCredentialDeploymentInformation } from '../../utils/serializationHelpers';

interface Props {
    identity: Identity | undefined;
    address: string;
    attributes: string[];
    setReady: (ready: boolean) => void;
    setCredential: (cred: CredentialDeploymentInformation) => void;
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

        try {
            serializeCredentialDeploymentInformation(credential).toString(
                'hex'
            );
            console.log('text');
        } catch (e) {
            console.log(e);
            console.log('error');
        }

        setCredential(credential);
        insertNewCredential(address, credentialNumber, identity.id, credential);
        setMessage('Credential generated succesfully!');
        setReady(true);
    }

    return <LedgerComponent ledgerCall={sign} />;
}
