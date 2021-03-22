import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { LocationDescriptorObject } from 'history';
import { parse } from '~/utils/JSONHelper';
import routes from '../../constants/routes.json';
import GenericSignTransactionProposalView from './GenericSignTransactionProposalView';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { findAccountTransactionHandler } from '../../utils/updates/HandlerFinder';
import { UpdateAccountCredentials } from '../../utils/types';
import { TransactionInput } from '../../utils/transactionTypes';
import getTransactionHash from '~/utils/transactionHash';
import { buildTransactionAccountSignature } from '~/utils/transactionHelpers';
import { getCredentialsOfAccount } from '~/database/CredentialDao';

interface Props {
    location: LocationDescriptorObject<TransactionInput>;
}

/**
 * Component that displays an overview of an imported multi signature transaction proposal
 * that is to be signed.
 */
export default function CosignTransactionProposalView({ location }: Props) {
    const [transactionHash, setTransactionHash] = useState<string>();

    const dispatch = useDispatch();

    if (!location.state) {
        throw new Error(
            'No transaction handler was found. An invalid transaction has been received.'
        );
    }

    const { transaction } = location.state;
    const [transactionObject] = useState<UpdateAccountCredentials>(
        parse(transaction)
    );
    const [transactionHandler] = useState(
        findAccountTransactionHandler(transactionObject.transactionKind)
    );

    useEffect(() => {
        setTransactionHash(getTransactionHash(transactionObject));
    }, [setTransactionHash, transactionObject]);

    async function signingFunction(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        const signatureIndex = 0;

        const credential = (
            await getCredentialsOfAccount(transactionObject.sender)
        )[2];
        console.log(credential);

        if (
            credential.identityId === undefined ||
            credential.credentialNumber === undefined ||
            credential.credentialIndex === undefined
        ) {
            // TODO: Use LocalCredential
            setMessage(
                'Unable to sign transfer, because we were unable to find local and deployed credential'
            );
            return;
        }

        const path = {
            identityIndex: credential.identityId,
            accountIndex: credential.credentialNumber,
            signatureIndex,
        };

        const signatureBytes = await transactionHandler.signTransaction(
            transactionObject,
            ledger,
            path
        );

        const signatures = buildTransactionAccountSignature(
            credential.credentialIndex,
            signatureIndex,
            signatureBytes
        );
        // Load the page for exporting the signed transaction.
        dispatch(
            push({
                pathname: routes.MULTISIGTRANSACTIONS_EXPORT_TRANSACTION,
                state: {
                    transaction,
                    transactionHash,
                    signatures,
                },
            })
        );
    }

    const checkboxLabels = [
        'The hash matches the one received exactly',
        'The picture matches the one received exactly',
        'The transaction details are correct',
    ];

    if (!transactionHash) {
        return null;
    }

    return (
        <GenericSignTransactionProposalView
            header={transactionHandler.title}
            transaction={transaction}
            transactionHash={transactionHash}
            signFunction={signingFunction}
            checkboxes={checkboxLabels}
            signText="Co-sign"
        />
    );
}
