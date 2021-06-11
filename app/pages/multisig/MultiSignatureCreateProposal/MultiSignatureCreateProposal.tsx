import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { useParams, Route, Switch } from 'react-router';
import { FieldValues } from 'react-hook-form';
import Modal from '~/cross-app-components/Modal';
import {
    AuthorizationKeysUpdate,
    HigherLevelKeyUpdate,
    instanceOfUpdateInstruction,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateType,
    TransactionTypes,
} from '~/utils/types';
import routes from '~/constants/routes.json';
import { findUpdateInstructionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import Loading from '~/cross-app-components/Loading';
import { proposalsSelector } from '~/features/MultiSignatureSlice';
import { parse } from '~/utils/JSONHelper';
import { secondsSinceUnixEpoch } from '~/utils/timeHelpers';

import withChainData, { ChainData } from '../common/withChainData';
import MultiSignatureLayout from '../MultiSignatureLayout';
import SignTransactionProposal from '../SignTransactionProposal';
import BuildProposal from './BuildProposal';
import { createProposalRoute } from '~/utils/routerHelper';

export interface MultiSignatureCreateProposalForm {
    effectiveTime: Date;
    expiryTime: Date;
}

function getSigningRoute(type: UpdateType) {
    return `${createProposalRoute(
        TransactionTypes.UpdateInstruction,
        type
    )}/sign`;
}

/**
 * Component for displaying the UI required to create a multi signature transaction
 * proposal. It dynamically loads the correct component to show wrapped in a bit of
 * generic UI.
 * The component retrieves the block summary of the last finalized block, which
 * is used to get the threshold and sequence number required for update instructions.
 */
function MultiSignatureCreateProposal({
    blockSummary,
    consensusStatus,
}: ChainData) {
    const proposals = useSelector(proposalsSelector);
    const [restrictionModalOpen, setRestrictionModalOpen] = useState(false);
    const [defaults, setDefaults] = useState<Partial<FieldValues & MultiSignatureCreateProposalForm>>({});

    const [proposal, setProposal] = useState<
    Partial<MultiSignatureTransaction>
    >();
    const dispatch = useDispatch();

    // TODO Add support for account transactions.
    const { updateType } = useParams<{ updateType: string }>();
    const type = parseInt(updateType, 10);

    const handler = findUpdateInstructionHandler(type);

    const UpdateComponent = handler.update;

    function openDuplicateTypeExists(): boolean {
        return proposals.some((existingProposal) => {
            const existingUpdateInstruction = parse(
                existingProposal.transaction
            );
            return (
                instanceOfUpdateInstruction(existingUpdateInstruction) &&
                existingProposal.status ===
                    MultiSignatureTransactionStatus.Open &&
                existingUpdateInstruction.type === type
            );
        });
    }

    async function handleSubmit(
        fields: FieldValues & MultiSignatureCreateProposalForm
    ): Promise<void> {
        if (!blockSummary) {
            return;
        }
        const { effectiveTime, expiryTime, ...dynamicFields } = fields;
        const effectiveTimeInSeconds = BigInt(
            secondsSinceUnixEpoch(effectiveTime)
        );
        const expiryTimeInSeconds = BigInt(secondsSinceUnixEpoch(expiryTime));

        const newProposal = await handler.createTransaction(
            blockSummary,
            dynamicFields,
            effectiveTimeInSeconds,
            expiryTimeInSeconds
        );

        setDefaults(fields);
        setProposal(newProposal);

        if (newProposal) {
            dispatch(push(getSigningRoute(type)));
        }
    }

    /**
     * Form submit function used for the higher level keys updates. They do not
     * use Form element to input all the keys, so therefore it cannot use the
     * regular handleSubmit function.
     */
    async function handleKeySubmit(
        effectiveTime: Date,
        expiryTime: Date,
        keyUpdate:
            | Partial<HigherLevelKeyUpdate>
            | Partial<AuthorizationKeysUpdate>
    ) {
        if (!blockSummary) {
            return;
        }
        const effectiveTimeInSeconds = BigInt(
            secondsSinceUnixEpoch(effectiveTime)
        );

        setDefaults({effectiveTime, expiryTime, keyUpdate});

        const expiryTimeInSeconds = BigInt(secondsSinceUnixEpoch(expiryTime));
        const newProposal = await handler.createTransaction(
            blockSummary,
            keyUpdate,
            effectiveTimeInSeconds,
            expiryTimeInSeconds
        );

        setProposal(newProposal);

        if (newProposal) {
            dispatch(push(getSigningRoute(type)));
        }
    }

    if (!restrictionModalOpen && openDuplicateTypeExists()) {
        setRestrictionModalOpen(true);
    }

    const isKeyUpdate = [
        UpdateType.UpdateRootKeys,
        UpdateType.UpdateLevel1KeysUsingRootKeys,
        UpdateType.UpdateLevel1KeysUsingLevel1Keys,
        UpdateType.UpdateLevel2KeysUsingRootKeys,
        UpdateType.UpdateLevel2KeysUsingLevel1Keys,
    ].includes(type);

    return (
        <>
            <Modal
                open={restrictionModalOpen}
                onOpen={() => {}}
                onClose={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
            >
                An update of this type is already open, and must be submitted or
                closed, before opening a new update of the same kind.
            </Modal>

            <Switch>
                <Route
                    path={routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION}
                    render={() => (
                        <SignTransactionProposal
                            proposal={proposal as MultiSignatureTransaction}
                        />
                    )}
                />
                <Route
                    render={() => (
                        <MultiSignatureLayout
                            pageTitle={handler.title}
                            stepTitle={`Transaction Proposal - ${handler.type}`}
                            delegateScroll
                        >
                            {isKeyUpdate || (
                                <BuildProposal
                                    type={type}
                                    handleSubmit={handleSubmit}
                                    blockSummary={blockSummary}
                                    consensusStatus={consensusStatus}
                                    defaults={defaults}
                                />
                            )}
                            {isKeyUpdate &&
                             (!blockSummary || !consensusStatus) && (
                                 <Loading text="Getting current settings from chain" />
                            )}
                            {blockSummary && consensusStatus && isKeyUpdate && (
                                <UpdateComponent
                                    defaults={defaults}
                                    blockSummary={blockSummary}
                                    consensusStatus={consensusStatus}
                                    handleHigherLevelKeySubmit={handleKeySubmit}
                                    handleAuthorizationKeySubmit={
                                    handleKeySubmit
                                    }
                                />
                            )}
                        </MultiSignatureLayout>
                    )}
                />
            </Switch>
        </>
    );
}

export default withChainData(MultiSignatureCreateProposal);
