import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { LocationDescriptorObject } from 'history';
import { parse } from 'json-bigint';
import { hashSha256 } from '../../utils/serializationHelpers';
import routes from '../../constants/routes.json';
import UpdateInstructionHandler from '../../utils/UpdateInstructionHandler';
import {
    AccountTransaction,
    TransactionHandler,
    UpdateInstruction,
} from '../../utils/types';
import GenericSignTransactionProposalView from './GenericSignTransactionProposalView';

interface Props {
    location: LocationDescriptorObject<TransactionInput>;
}

interface TransactionInput {
    transaction: string;
    type: string;
}

/**
 * Component that displays an overview of an imported multi signature transaction proposal
 * that is to be signed.
 */
export default function CosignTransactionProposalView({ location }: Props) {
    const [transactionHash, setTransactionHash] = useState<string>();
    const [transactionHandler, setTransactionHandler] = useState<
        TransactionHandler<UpdateInstruction | AccountTransaction>
    >();

    const dispatch = useDispatch();

    if (!location.state) {
        throw new Error(
            'No transaction handler was found. An invalid transaction has been received.'
        );
    }

    const { transaction } = location.state;
    const { type } = location.state;

    useEffect(() => {
        const transactionObject = parse(transaction);
        // TODO Add AccountTransactionHandler here when implemented.
        const transactionHandlerValue =
            type === 'UpdateInstruction'
                ? new UpdateInstructionHandler(transactionObject)
                : new UpdateInstructionHandler(transactionObject);
        setTransactionHandler(transactionHandlerValue);

        const serialized = transactionHandlerValue.serializeTransaction();
        const hashed = hashSha256(serialized).toString('hex');
        setTransactionHash(hashed);
    }, [setTransactionHandler, setTransactionHash, type, transaction]);

    async function signingFunction<ConcordiumLedgerClient>(
        ledger: ConcordiumLedgerClient
    ) {
        const signatureBytes = await transactionHandler.signTransaction(ledger);
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
