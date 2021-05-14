import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { stringify } from 'json-bigint';
import { useParams } from 'react-router';
import { FieldValues } from 'react-hook-form';
import {
    HigherLevelKeyUpdate,
    instanceOfUpdateInstruction,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateType,
} from '~/utils/types';
import routes from '~/constants/routes.json';
import { findUpdateInstructionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import Loading from '~/cross-app-components/Loading';
import Modal from '~/cross-app-components/Modal';
import { proposalsSelector, addProposal } from '~/features/MultiSignatureSlice';
import { parse } from '~/utils/JSONHelper';
import Form from '~/components/Form';
import { getNow, TimeConstants } from '~/utils/timeHelpers';
import { futureDate } from '~/components/Form/util/validation';

import styles from './MultiSignatureCreateProposal.module.scss';
import withChainData, { ChainData } from '../common/withChainData';
import MultiSignatureLayout from '../MultiSignatureLayout';

import { insert } from '~/database/MultiSignatureProposalDao';
import { selectedProposalRoute } from '~/utils/routerHelper';

export interface MultiSignatureCreateProposalForm {
    effectiveTime: Date;
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
    const [toSign, setToSign] = useState(false);
    const dispatch = useDispatch();

    // TODO Add support for account transactions.
    const { updateType } = useParams<{ updateType: string }>();
    const type = parseInt(updateType, 10);

    const displayType = UpdateType[type];

    const handler = findUpdateInstructionHandler(type);
    const UpdateComponent = handler.update;

    /**
     * Forwards the multi signature transactions to the signing page.
     */
    async function forwardTransactionToSigningPage(
        multiSignatureTransaction: Partial<MultiSignatureTransaction>
    ) {
        // Save to database and use the assigned id to update the local object.
        const entryId = (await insert(multiSignatureTransaction))[0];
        multiSignatureTransaction.id = entryId;

        // Set the current proposal in the state to the one that was just generated.
        dispatch(addProposal(multiSignatureTransaction));

        if (toSign) {
            const signInput = {
                multiSignatureTransaction,
            };

            // Forward the transaction under creation to the signing page.
            dispatch(
                push({
                    pathname: routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION,
                    state: stringify(signInput),
                })
            );
        } else {
            dispatch(push(selectedProposalRoute(entryId)));
        }
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

    async function handleSubmit(
        fields: FieldValues & MultiSignatureCreateProposalForm
    ): Promise<void> {
        if (!blockSummary) {
            return;
        }

        const { effectiveTime, ...dynamicFields } = fields;
        const timeInSeconds = BigInt(
            Math.round(effectiveTime.getTime() / 1000)
        );

        const proposal = await handler.createTransaction(
            blockSummary,
            dynamicFields,
            timeInSeconds
        );

        if (proposal) {
            forwardTransactionToSigningPage(proposal);
        }
    }

    /**
     * Form submit function used for the higher level keys updates. They do not
     * use Form element to input all the keys, so therefore it cannot use the
     * regular handleSubmit function.
     */
    async function handleKeySubmit(
        effectiveTime: Date,
        higherLevelKeyUpdate: Partial<HigherLevelKeyUpdate>
    ) {
        if (!blockSummary) {
            return;
        }
        const timeInSeconds = BigInt(
            Math.round(effectiveTime.getTime() / 1000)
        );
        const proposal = await handler.createTransaction(
            blockSummary,
            higherLevelKeyUpdate,
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

    let component;
    if (
        [
            UpdateType.UpdateRootKeys,
            UpdateType.UpdateLevel1KeysUsingRootKeys,
            UpdateType.UpdateLevel1KeysUsingLevel1Keys,
        ].includes(type)
    ) {
        if (!blockSummary || !consensusStatus) {
            component = <Loading text="Getting current settings from chain" />;
        } else {
            component = (
                <UpdateComponent
                    blockSummary={blockSummary}
                    consensusStatus={consensusStatus}
                    handleKeySubmit={handleKeySubmit}
                />
            );
        }
    } else {
        component = (
            <>
                <h3 className={styles.subHeader}>Transaction details</h3>
                <Form<FieldValues & MultiSignatureCreateProposalForm>
                    className={styles.details}
                    onSubmit={handleSubmit}
                >
                    <div className={styles.proposal}>
                        <p>
                            Add all the details for the {displayType}{' '}
                            transaction below.
                        </p>
                        {blockSummary && consensusStatus ? (
                            <>
                                <UpdateComponent
                                    blockSummary={blockSummary}
                                    consensusStatus={consensusStatus}
                                />
                                <Form.Timestamp
                                    name="effectiveTime"
                                    label="Effective Time"
                                    defaultValue={
                                        new Date(
                                            getNow() + 5 * TimeConstants.Minute
                                        )
                                    }
                                    rules={{
                                        required: 'Effective time is required',
                                        validate: futureDate(
                                            'Effective time must be in the future'
                                        ),
                                    }}
                                />
                            </>
                        ) : (
                            <Loading text="Getting current settings from chain" />
                        )}
                    </div>
                    <div className="flex">
                        <Form.Submit
                            className="mR10"
                            onClick={() => setToSign(true)}
                            disabled={!blockSummary}
                        >
                            Sign Transaction
                        </Form.Submit>
                        <Form.Submit className="mL10" disabled={!blockSummary}>
                            Skip signing
                        </Form.Submit>
                    </div>
                </Form>
            </>
        );
    }

    return (
        <MultiSignatureLayout
            pageTitle={handler.title}
            stepTitle={`Transaction Proposal - ${handler.type}`}
        >
            {RestrictionModal}
            {component}
        </MultiSignatureLayout>
    );
}

export default withChainData(MultiSignatureCreateProposal);
