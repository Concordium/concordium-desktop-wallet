import React from 'react';
import { useSelector } from 'react-redux';
import { Identity, CredentialDeploymentInformation } from '../../utils/types';
import { createCredentialInfo } from '../../utils/rustInterface';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import LedgerComponent from '../../components/ledger/LedgerComponent';
import { globalSelector } from '../../features/GlobalSlice';

interface Props {
    identity: Identity | undefined;
    address: string;
    attributes: string[];
    setReady: (ready: boolean) => void;
    setCredential: (cred: CredentialDeploymentInformation) => void;
}

// The entrance into the flow is the last Route (which should have no path), otherwise the flow is controlled by the components themselves
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

        const credential = await createCredentialInfo(
            identity,
            200, // FIXME
            global,
            attributes,
            setMessage,
            ledger,
            address
        );
        setCredential(credential);
        setMessage('Credential generated succesfully!');
        setReady(true);
    }

    return <LedgerComponent ledgerCall={sign} />;
}
