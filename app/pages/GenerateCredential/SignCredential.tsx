import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Identity, CredentialDeploymentInformation } from '../../utils/types';
import { createCredentialInfo } from '../../utils/rustInterface';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import LedgerComponent from '../../components/ledger/LedgerComponent';
import { getNextCredentialNumber } from '../../database/CredentialDao';
import { insertNewCredential } from '../../features/CredentialSlice';
import { globalSelector } from '../../features/GlobalSlice';

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
    const dispatch = useDispatch();

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
        setCredential(credential);
        insertNewCredential(
            dispatch,
            address,
            credentialNumber,
            identity.id,
            credential
        );
        setMessage('Credential generated succesfully!');
        setReady(true);
    }

    return <LedgerComponent ledgerCall={sign} />;
}
