import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { useParams, Route, Switch } from 'react-router';
import { FieldValues } from 'react-hook-form';
import Modal from '~/cross-app-components/Modal';
import {
    instanceOfUpdateInstruction,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateType,
    TransactionTypes,
} from '~/utils/types';
import routes from '~/constants/routes.json';
import { findUpdateInstructionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import { proposalsSelector } from '~/features/MultiSignatureSlice';
import { getUpdateQueueTypes } from '~/utils/UpdateInstructionHelper';
import { parse } from '~/utils/JSONHelper';

import { ensureChainData, ChainData } from '~/utils/withChainData';
import MultiSignatureLayout from '../MultiSignatureLayout';
import SignTransactionProposal from '../SignTransactionProposal';
import BuildProposal from './BuildProposal';
import BuildKeyProposal from './BuildKeyProposal';
import { createProposalRoute } from '~/utils/routerHelper';

import Loading from '~/cross-app-components/Loading';
import { ensureUpdateQueue, WithUpdateQueues } from '~/utils/withUpdateQueue';

const CLOSE_ROUTE = routes.MULTISIGTRANSACTIONS_GOV;

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
    chainParameters,
    consensusStatus,
    nextUpdateSequenceNumbers,
}: Required<ChainData> & WithUpdateQueues) {
    const proposals = useSelector(proposalsSelector);
    const [restrictionModalOpen, setRestrictionModalOpen] = useState(false);
    const [defaults, setDefaults] = useState<
        Partial<FieldValues & MultiSignatureCreateProposalForm>
    >({});

    const [proposal, setProposal] = useState<
        Omit<MultiSignatureTransaction, 'id'>
    >();
    const dispatch = useDispatch();

    // TODO Add support for account transactions.
    const { updateType } = useParams<{ updateType: string }>();
    const type = parseInt(updateType, 10);

    const handler = findUpdateInstructionHandler(type);

    function openDuplicateTypeExists(): boolean {
        const updateQueueTypes = getUpdateQueueTypes(type);
        return proposals.some((existingProposal) => {
            const existingUpdateInstruction = parse(
                existingProposal.transaction
            );
            return (
                instanceOfUpdateInstruction(existingUpdateInstruction) &&
                existingProposal.status ===
                    MultiSignatureTransactionStatus.Open &&
                updateQueueTypes.includes(existingUpdateInstruction.type)
            );
        });
    }

    function handleProposal(
        newProposal: Omit<MultiSignatureTransaction, 'id'> | undefined,
        newDefaults: FieldValues
    ) {
        setDefaults(newDefaults);
        setProposal(newProposal);
        dispatch(push(getSigningRoute(type)));
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

    const hasNoEffectiveTime = [UpdateType.UpdateCreatePltParameters].includes(
        type
    );

    const BuildComponent = isKeyUpdate ? BuildKeyProposal : BuildProposal;

    return (
        <>
            <Modal
                open={restrictionModalOpen}
                onOpen={() => {}}
                onClose={() => dispatch(push(CLOSE_ROUTE))}
            >
                An unsubmitted update of this type already exists, and must be
                submitted or cancelled, before a new update of the same kind can
                be created.
            </Modal>

            <Switch>
                <Route
                    path={routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION}
                    render={() => (
                        <SignTransactionProposal
                            proposal={proposal}
                            chainParameters={chainParameters}
                        />
                    )}
                />
                <Route
                    render={() => (
                        <MultiSignatureLayout
                            pageTitle={handler.title}
                            delegateScroll={isKeyUpdate}
                            closeRoute={CLOSE_ROUTE}
                        >
                            <BuildComponent
                                type={type}
                                onFinish={handleProposal}
                                chainParameters={chainParameters}
                                nextUpdateSequenceNumbers={
                                    nextUpdateSequenceNumbers
                                }
                                consensusStatus={consensusStatus}
                                defaults={defaults}
                                hasEffectiveTime={!hasNoEffectiveTime}
                            />
                        </MultiSignatureLayout>
                    )}
                />
            </Switch>
        </>
    );
}

function LoadingComponent() {
    return (
        <MultiSignatureLayout
            pageTitle="Create multisignature proposal"
            closeRoute={CLOSE_ROUTE}
        >
            <Loading text="Fetching information from the node" />
        </MultiSignatureLayout>
    );
}

export default ensureUpdateQueue(
    ensureChainData(MultiSignatureCreateProposal, LoadingComponent)
);
