import React, { useEffect, useState } from 'react';
import { parse } from 'json-bigint';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { LocationDescriptorObject } from 'history';
import { hashSha256 } from '../../utils/serializationHelpers';
import routes from '../../constants/routes.json';
import GenericSignTransactionProposalView from './GenericSignTransactionProposalView';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import { createUpdateInstructionHandler } from '../../utils/updates/HandlerFinder';
import {
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateInstructionSignature,
} from '../../utils/types';
import {
    UpdateInstructionHandler,
    TransactionInput,
} from '../../utils/transactionTypes';
import { serializeUpdateInstructionHeaderAndPayload } from '../../utils/UpdateSerialization';
import { BlockSummary, ConsensusStatus } from '../../utils/NodeApiTypes';
import { getBlockSummary, getConsensusStatus } from '../../utils/nodeRequests';
import DynamicModal from './DynamicModal';
import SimpleErrorModal from '../../components/SimpleErrorModal';
import findAuthorizationKey from '../../utils/updates/AuthorizationHelper';

interface Props {
    location: LocationDescriptorObject<TransactionInput>;
}

/**
 * Component that displays an overview of an imported multi signature transaction proposal
 * that is to be signed.
 */
export default function CosignTransactionProposalView({ location }: Props) {
    const [showValidationError, setShowValidationError] = useState(false);
    const [blockSummary, setBlockSummary] = useState<BlockSummary>();
    const [transactionHash, setTransactionHash] = useState<string>();
    const [transactionHandler] = useState<
        UpdateInstructionHandler<
            UpdateInstruction<UpdateInstructionPayload>,
            ConcordiumLedgerClient
        >
    >(() => createUpdateInstructionHandler(location.state));

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
        if (blockSummary) {
            const authorizationKey = await findAuthorizationKey(
                ledger,
                transactionHandler,
                blockSummary.updates.authorizations
            );
            if (!authorizationKey) {
                setShowValidationError(true);
                return;
            }

            const signatureBytes = await transactionHandler.signTransaction(
                transactionObject,
                ledger
            );

            const signature: UpdateInstructionSignature = {
                signature: signatureBytes.toString('hex'),
                authorizationKeyIndex: authorizationKey.index,
            };

            // Load the page for exporting the signed transaction.
            dispatch(
                push({
                    pathname: routes.MULTISIGTRANSACTIONS_EXPORT_TRANSACTION,
                    state: {
                        transaction,
                        transactionHash,
                        signatures: [signature],
                    },
                })
            );
        }
    }

    function updateBlockSummary(blockSummaryInput: BlockSummary) {
        setBlockSummary(blockSummaryInput);
    }

    async function execution() {
        const consensusStatus: ConsensusStatus = await getConsensusStatus();
        return getBlockSummary(consensusStatus.lastFinalizedBlock);
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
        <>
            <DynamicModal
                execution={execution}
                onError={() => {
                    dispatch(push({ pathname: routes.MULTISIGTRANSACTIONS }));
                }}
                onSuccess={(input: BlockSummary) => updateBlockSummary(input)}
                title="Error communicating with node"
                content="We were unable to retrieve the block summary from the
            configured node. Verify your node settings, and check that
            the node is running."
            />
            <SimpleErrorModal
                show={showValidationError}
                header="Unauthorized key"
                content="Your key is not authorized to sign this update type."
                onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
            />
            <GenericSignTransactionProposalView
                header={transactionHandler.title}
                transaction={transaction}
                transactionHash={transactionHash}
                signFunction={signingFunction}
                checkboxes={checkboxLabels}
                signText="Co-sign"
                loading={!blockSummary}
            />
        </>
    );
}
