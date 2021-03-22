import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { stringify } from 'json-bigint';
import { useParams } from 'react-router';

import { FieldValues } from 'react-hook-form';
import {
    instanceOfUpdateInstruction,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateType,
} from '~/utils/types';
import { getBlockSummary, getConsensusStatus } from '~/utils/nodeRequests';
import { BlockSummary, ConsensusStatus } from '~/utils/NodeApiTypes';
import routes from '~/constants/routes.json';
import findHandler from '~/utils/updates/HandlerFinder';
import PageLayout from '~/components/PageLayout';
import Loading from '~/cross-app-components/Loading';
import Modal from '~/cross-app-components/Modal';
import { proposalsSelector } from '~/features/MultiSignatureSlice';
import { parse } from '~/utils/JSONHelper';
import Form from '~/components/Form';
import { getNow, TimeConstants } from '~/utils/timeHelpers';
import { futureDate } from '~/components/Form/util/validation';

import DynamicModal from '../DynamicModal';
import styles from './MultiSignatureCreateProposal.module.scss';

interface MultiSignatureCreateProposalForm {
    effectiveTime: Date;
}

/**
 * Component for displaying the UI required to create a multi signature transaction
 * proposal. It dynamically loads the correct component to show wrapped in a bit of
 * generic UI.
 * The component retrieves the block summary of the last finalized block, which
 * is used to get the threshold and sequence number required for update instructions.
 */
export default function MultiSignatureCreateProposalView() {
    const [blockSummary, setBlockSummary] = useState<BlockSummary>();
    const [loading, setLoading] = useState(true);
    const proposals = useSelector(proposalsSelector);
    const [restrictionModalOpen, setRestrictionModalOpen] = useState(false);
    const dispatch = useDispatch();

    // TODO Add support for account transactions.
    const { updateType } = useParams<{ updateType: string }>();
    const type = parseInt(updateType, 10);

    const displayType = UpdateType[type];

    const handler = findHandler(type);
    const UpdateComponent = handler.update;

    function updateBlockSummary(blockSummaryInput: BlockSummary) {
        setBlockSummary(blockSummaryInput);
        setLoading(false);
    }

    async function execution() {
        const consensusStatus: ConsensusStatus = await getConsensusStatus();
        return getBlockSummary(consensusStatus.lastFinalizedBlock);
    }

    /**
     * Forwards the multi signature transactions to the signing page.
     */
    async function forwardTransactionToSigningPage(
        multiSignatureTransaction: Partial<MultiSignatureTransaction>
    ) {
        const signInput = {
            multiSignatureTransaction,
            blockSummary,
        };

        // Forward the transaction under creation to the signing page.
        dispatch(
            push({
                pathname: routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION,
                state: stringify(signInput),
            })
        );
    }

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

    function handleSubmit(
        fields: FieldValues & MultiSignatureCreateProposalForm
    ): void {
        if (!blockSummary) {
            return;
        }

        const { effectiveTime, ...dynamicFields } = fields;
        const timeInSeconds = BigInt(
            Math.round(effectiveTime.getTime() / 1000)
        );

        const proposal = handler.createTransaction(
            blockSummary,
            dynamicFields,
            timeInSeconds
        );

        if (proposal) {
            forwardTransactionToSigningPage(proposal);
        }
    }

    const RestrictionModal = (
        <Modal
            open={restrictionModalOpen}
            onOpen={() => {}}
            onClose={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
        >
            An update of this type is already open, and must be submitted or
            closed, before opening a new update of the same kind.
        </Modal>
    );

    if (!restrictionModalOpen && openDuplicateTypeExists()) {
        setRestrictionModalOpen(true);
    }

    return (
        <PageLayout>
            {RestrictionModal}
            <PageLayout.Header>
                <h1>{handler.title}</h1>
            </PageLayout.Header>
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
            <PageLayout.Container
                closeRoute={routes.MULTISIGTRANSACTIONS}
                className={styles.container}
            >
                <h2 className={styles.header}>
                    Transaction Proposal | {displayType}
                </h2>
                <PageLayout.FullWidthContainerSection
                    className={styles.content}
                >
                    <h3 className={styles.subHeader}>Transaction details</h3>
                    <Form<FieldValues & MultiSignatureCreateProposalForm>
                        className={styles.details}
                        onSubmit={handleSubmit}
                    >
                        <p>
                            Add all the details for the {displayType}{' '}
                            transaction below.
                        </p>
                        <div className={styles.proposal}>
                            {loading && <Loading />}
                            {blockSummary && (
                                <>
                                    <UpdateComponent
                                        blockSummary={blockSummary}
                                    />
                                    <Form.Timestamp
                                        name="effectiveTime"
                                        defaultValue={
                                            new Date(
                                                getNow() +
                                                    5 * TimeConstants.Minute
                                            )
                                        }
                                        rules={{
                                            required:
                                                'Effective time is required',
                                            validate: futureDate(
                                                'Effective time must be in the future'
                                            ),
                                        }}
                                    />
                                </>
                            )}
                        </div>
                        <Form.Submit disabled={!blockSummary}>
                            Continue
                        </Form.Submit>
                    </Form>
                </PageLayout.FullWidthContainerSection>
            </PageLayout.Container>
        </PageLayout>
    );
}
