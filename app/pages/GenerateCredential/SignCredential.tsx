import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { createCredentialInfo } from '~/utils/rustInterface';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import SimpleLedger from '~/components/ledger/SimpleLedger';
import { getNextCredentialNumber } from '~/database/CredentialDao';
import { globalSelector } from '~/features/GlobalSlice';
import pairWallet from '~/utils/WalletPairing';
import generateCredentialContext from './GenerateCredentialContext';

/**
 * Component for creating the credential information. The user is prompted to sign
 * the necessary information to create it as part of the flow.
 */
export default function SignCredential(): JSX.Element {
    const global = useSelector(globalSelector);
    const {
        identity: [identity],
        attributes: [attributes],
        address: [address],
        isReady: [, setReady],
        credential: [, setCredential],
    } = useContext(generateCredentialContext);

    async function sign(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        if (!identity) {
            throw new Error(
                'An identity has to be supplied. This is an internal error.'
            );
        } else if (!global) {
            throw new Error(
                'The global information is missing. Make sure that you have previously connected to a node.'
            );
        }

        const walletId = await pairWallet(ledger);
        if (walletId !== identity.walletId) {
            throw new Error(
                'The chosen identity was not created using the connected wallet.'
            );
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
