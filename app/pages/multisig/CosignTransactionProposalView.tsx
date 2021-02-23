import React, { useEffect, useState } from 'react';
import { parse } from 'json-bigint';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { LocationDescriptorObject } from 'history';
import { hashSha256 } from '../../utils/serializationHelpers';
import routes from '../../constants/routes.json';
import GenericSignTransactionProposalView from './GenericSignTransactionProposalView';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { createTransactionHandler } from '../../utils/transactionHelpers';
import { UpdateInstruction, UpdateInstructionPayload } from '../../utils/types';
import {
    TransactionHandler,
    TransactionInput,
} from '../../utils/transactionTypes';
import { serializeUpdateInstructionHeaderAndPayload } from '../../utils/UpdateSerialization';

interface Props {
    location: LocationDescriptorObject<TransactionInput>;
}

/**
 * Component that displays an overview of an imported multi signature transaction proposal
 * that is to be signed.
 */
export default function CosignTransactionProposalView({ location }: Props) {
    const [transactionHash, setTransactionHash] = useState<string>();
    const [transactionHandler] = useState<
        TransactionHandler<
            UpdateInstruction<UpdateInstructionPayload>,
            ConcordiumLedgerClient
        >
    >(() => createTransactionHandler(location.state));

    const dispatch = useDispatch();

    if (!location.state) {
        throw new Error(
            'No transaction handler was found. An invalid transaction has been received.'
        );
    }

    const { transaction } = location.state;
    const [transactionObject] = useState(parse(transaction));

    useEffect(() => {
        const serialized = serializeUpdateInstructionHeaderAndPayload(
            transactionObject,
            transactionHandler.serializePayload(transactionObject)
        );
        const hashed = hashSha256(serialized).toString('hex');
        setTransactionHash(hashed);
    }, [setTransactionHash, transactionHandler, transactionObject]);

    async function signingFunction(ledger: ConcordiumLedgerClient) {
        const signatureBytes = await transactionHandler.signTransaction(
            transactionObject,
            ledger
        );
        const signature = signatureBytes.toString('hex');

        // Load the page for exporting the signed transaction.
        dispatch(
            push({
                pathname: routes.MULTISIGTRANSACTIONS_EXPORT_TRANSACTION,
                state: { transaction, transactionHash, signature },
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
            transaction={transaction}
            transactionHash={transactionHash}
            signFunction={signingFunction}
            checkboxes={checkboxLabels}
            signText="Co-sign"
        />
    );
}
