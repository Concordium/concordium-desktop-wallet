import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { stringify } from 'json-bigint';
import { useParams } from 'react-router';

import { FieldValues } from 'react-hook-form';
import {
    AuthorizationKeysUpdate,
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
import { proposalsSelector } from '~/features/MultiSignatureSlice';
import { parse } from '~/utils/JSONHelper';
import Form from '~/components/Form';
import {
    getDefaultExpiry,
    getNow,
    secondsSinceUnixEpoch,
    TimeConstants,
} from '~/utils/timeHelpers';
import { futureDate, maxDate } from '~/components/Form/util/validation';

import styles from './MultiSignatureCreateProposal.module.scss';
import withChainData, { ChainData } from '../common/withChainData';
import MultiSignatureLayout from '../MultiSignatureLayout';

export interface MultiSignatureCreateProposalForm {
    effectiveTime: Date;
    expiryTime: Date;
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
    const dispatch = useDispatch();
    const [effective, setEffective] = useState<Date | undefined>(
        new Date(getNow() + 5 * TimeConstants.Minute)
    );

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

        const proposal = await handler.createTransaction(
            blockSummary,
            dynamicFields,
            effectiveTimeInSeconds,
            expiryTimeInSeconds
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
        const expiryTimeInSeconds = BigInt(secondsSinceUnixEpoch(expiryTime));
        const proposal = await handler.createTransaction(
            blockSummary,
            keyUpdate,
            effectiveTimeInSeconds,
            expiryTimeInSeconds
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

    function keyUpdateComponent() {
        if (!blockSummary || !consensusStatus) {
            return <Loading text="Getting current settings from chain" />;
        }
        if (
            UpdateType.UpdateLevel2KeysUsingRootKeys === type ||
            UpdateType.UpdateLevel2KeysUsingLevel1Keys === type
        ) {
            return (
                <div className={styles.subtractContainerPadding}>
                    <UpdateComponent
                        blockSummary={blockSummary}
                        consensusStatus={consensusStatus}
                        handleAuthorizationKeySubmit={handleKeySubmit}
                    />
                </div>
            );
        }
        return (
            <div className={styles.subtractContainerPadding}>
                <UpdateComponent
                    blockSummary={blockSummary}
                    consensusStatus={consensusStatus}
                    handleKeySubmit={handleKeySubmit}
                />
            </div>
        );
    }

    if (
        [
            UpdateType.UpdateRootKeys,
            UpdateType.UpdateLevel1KeysUsingRootKeys,
            UpdateType.UpdateLevel1KeysUsingLevel1Keys,
            UpdateType.UpdateLevel2KeysUsingRootKeys,
            UpdateType.UpdateLevel2KeysUsingLevel1Keys,
        ].includes(type)
    ) {
        return (
            <MultiSignatureLayout
                pageTitle={handler.title}
                stepTitle={`Transaction Proposal - ${handler.type}`}
                delegateScroll
            >
                {RestrictionModal}
                {keyUpdateComponent()}
            </MultiSignatureLayout>
        );
    }

    return (
        <MultiSignatureLayout
            pageTitle={handler.title}
            stepTitle={`Transaction Proposal - ${handler.type}`}
        >
            {RestrictionModal}
            <h3 className={styles.subHeader}>Transaction details</h3>
            <Form<FieldValues & MultiSignatureCreateProposalForm>
                className={styles.details}
                onSubmit={handleSubmit}
            >
                <div className={styles.proposal}>
                    <p className="mT0">
                        Add all the details for the {displayType} transaction
                        below.
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
                                onChange={setEffective}
                                defaultValue={effective}
                                rules={{
                                    required: 'Effective time is required',
                                    validate: futureDate(
                                        'Effective time must be in the future'
                                    ),
                                }}
                            />
                            <Form.Timestamp
                                name="expiryTime"
                                label="Transaction Expiry Time"
                                defaultValue={getDefaultExpiry()}
                                rules={{
                                    required:
                                        'Transaction expiry time is required',
                                    validate: {
                                        ...(effective !== undefined
                                            ? {
                                                  beforeEffective: maxDate(
                                                      effective,
                                                      'Transaction expiry time must be before the effective time'
                                                  ),
                                              }
                                            : undefined),
                                        future: futureDate(
                                            'Transaction expiry time must be in the future'
                                        ),
                                    },
                                }}
                            />
                        </>
                    ) : (
                        <Loading text="Getting current settings from chain" />
                    )}
                </div>
                <Form.Submit disabled={!blockSummary}>Continue</Form.Submit>
            </Form>
        </MultiSignatureLayout>
    );
}

export default withChainData(MultiSignatureCreateProposal);
