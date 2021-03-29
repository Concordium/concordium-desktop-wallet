import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { parse, stringify } from 'json-bigint';
import * as ed from 'noble-ed25519';
import { Redirect, useParams } from 'react-router';
import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import {
    proposalsSelector,
    updateCurrentProposal,
} from '~/features/MultiSignatureSlice';
import TransactionDetails from '~/components/TransactionDetails';
import TransactionHashView from '~/components/TransactionHashView';
import {
    instanceOfUpdateInstruction,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    UpdateInstruction,
    UpdateInstructionPayload,
    UpdateInstructionSignature,
} from '~/utils/types';
import { saveFile } from '~/utils/FileHelper';
import {
    getBlockSummary,
    getConsensusStatus,
    sendTransaction,
} from '~/utils/nodeRequests';
import {
    serializeForSubmission,
    serializeUpdateInstructionHeaderAndPayload,
} from '~/utils/UpdateSerialization';
import { hashSha256 } from '~/utils/serializationHelpers';
import { getMultiSignatureTransactionStatus } from '~/utils/TransactionStatusPoller';
import SimpleErrorModal, {
    ModalErrorInput,
} from '~/components/SimpleErrorModal';
import routes from '~/constants/routes.json';
import findHandler from '~/utils/updates/HandlerFinder';
import { expirationEffect } from '~/utils/ProposalHelper';
import { BlockSummary, ConsensusStatus } from '~/utils/NodeApiTypes';
import ExpiredEffectiveTimeView from '../ExpiredEffectiveTimeView';
import Button from '~/cross-app-components/Button';
import Columns from '~/components/Columns';
import MultiSignatureLayout from '../MultiSignatureLayout';

import styles from './ProposalView.module.scss';
import Form from '~/components/Form';
import FileInput from '~/components/Form/FileInput';
import { FileInputValue } from '~/components/Form/FileInput/FileInput';
import CloseProposalModal from './CloseProposalModal';
import { fileListToFileArray } from '~/components/Form/FileInput/util';
import SignatureCheckboxes from './SignatureCheckboxes';
import TransactionExpirationDetails from '~/components/TransactionExpirationDetails';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import { getCheckboxName } from './SignatureCheckboxes/SignatureCheckboxes';

/**
 * Returns whether or not the given signature is valid for the proposal. The signature is valid if
 * one of the authorized verification keys can verify the signature successfully on the hash
 * of the serialized transaction.
 */
async function isSignatureValid(
    proposal: UpdateInstruction<UpdateInstructionPayload>,
    signature: UpdateInstructionSignature,
    blockSummary: BlockSummary
): Promise<boolean> {
    const handler = findHandler(proposal.type);
    const transactionHash = hashSha256(
        serializeUpdateInstructionHeaderAndPayload(
            proposal,
            handler.serializePayload(proposal)
        )
    );

    const matchingKey =
        blockSummary.updates.authorizations.keys[
            signature.authorizationKeyIndex
        ];
    return ed.verify(
        signature.signature,
        transactionHash,
        matchingKey.verifyKey
    );
}

const CLOSE_ROUTE = routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING;

interface ProposalViewProps {
    proposal: MultiSignatureTransaction;
}

/**
 * Component that displays the multi signature transaction proposal that is currently the
 * active one in the state. The component allows the user to export the proposal,
 * add signatures to the proposal, and if the signature threshold has been reached,
 * then the proposal can be submitted to a node.
 */
function ProposalView({ proposal }: ProposalViewProps) {
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [showError, setShowError] = useState<ModalErrorInput>({
        show: false,
    });
    const [currentlyLoadingFile, setCurrentlyLoadingFile] = useState(false);
    const [files, setFiles] = useState<FileInputValue>(null);
    const dispatch = useDispatch();
    const form = useForm();

    const instruction: UpdateInstruction<UpdateInstructionPayload> = parse(
        proposal.transaction
    );

    useEffect(() => {
        return expirationEffect(proposal, dispatch);
    }, [proposal, dispatch]);

    async function loadSignatureFile(file: Buffer) {
        setCurrentlyLoadingFile(true);
        let transactionObject;
        try {
            transactionObject = parse(file.toString('utf-8'));
        } catch (error) {
            setShowError({
                show: true,
                header: 'Invalid file',
                content:
                    'The chosen file was invalid. A file containing a signed multi signature transaction proposal in JSON format was expected.',
            });
            setCurrentlyLoadingFile(false);
            return;
        }

        if (instanceOfUpdateInstruction(transactionObject)) {
            if (proposal) {
                const update: UpdateInstruction<UpdateInstructionPayload> = parse(
                    proposal.transaction
                );

                // We currently restrict the amount of signatures imported at the same time to be 1, as it
                // simplifies error handling and currently it is only possible to export a file signed once.
                // This can be expanded to support multiple signatures at a later point in time if need be.
                if (transactionObject.signatures.length !== 1) {
                    setShowError({
                        show: true,
                        header: 'Invalid signature file',
                        content:
                            'The loaded signature file does not contain exactly one signature. Multiple signatures or zero signatures are not valid input.',
                    });
                    setCurrentlyLoadingFile(false);
                    return;
                }

                const signature = transactionObject.signatures[0];

                // Prevent the user from adding a signature that is already present on the proposal.
                if (
                    update.signatures
                        .map((sig) => sig.signature)
                        .includes(signature.signature)
                ) {
                    setShowError({
                        show: true,
                        header: 'Duplicate signature',
                        content:
                            'The loaded signature file contains a signature that is already present on the proposal.',
                    });
                    setCurrentlyLoadingFile(false);
                    return;
                }

                let validSignature = false;
                try {
                    const consensusStatus: ConsensusStatus = await getConsensusStatus();
                    const blockSummary = await getBlockSummary(
                        consensusStatus.lastFinalizedBlock
                    );
                    validSignature = await isSignatureValid(
                        update,
                        signature,
                        blockSummary
                    );
                } catch (error) {
                    // Can happen if the node is not reachable.
                    setShowError({
                        show: true,
                        header: 'Unable to reach node',
                        content:
                            'It was not possible to reach the node, which is required to validate that the loaded signature verifies against an authorization key.',
                    });
                    setCurrentlyLoadingFile(false);
                    return;
                }

                // Prevent the user from adding an invalid signature.
                if (!validSignature) {
                    setShowError({
                        show: true,
                        header: 'Invalid signature',
                        content:
                            'The loaded signature file contains a signature that is either not for this proposal, or was signed by an unauthorized key.',
                    });
                    setCurrentlyLoadingFile(false);
                    return;
                }

                update.signatures = update.signatures.concat(
                    transactionObject.signatures
                );
                const updatedProposal = {
                    ...proposal,
                    transaction: stringify(update),
                };

                updateCurrentProposal(dispatch, updatedProposal);
                setCurrentlyLoadingFile(false);
            }
        } else {
            setShowError({
                show: true,
                header: 'Invalid signature file',
                content:
                    'The loaded signature file is invalid. It should contain a signature for an account transaction or an update instruction in the exact format exported by this application.',
            });
            setCurrentlyLoadingFile(false);
        }
    }

    // Every time a signature file is dropped, try loading as signature.
    useEffect(() => {
        fileListToFileArray(files)
            .map(async (f) => Buffer.from(await f.arrayBuffer()))
            .forEach((p) => p.then(loadSignatureFile));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [files]);

    // Update form based on signatures on proposal.
    useEffect(() => {
        instruction.signatures.forEach((_, i) =>
            form.setValue(getCheckboxName(i), true)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instruction.signatures]);

    const handler = findHandler(instruction.type);
    const serializedPayload = handler.serializePayload(instruction);

    const transactionHash = hashSha256(
        serializeUpdateInstructionHeaderAndPayload(
            instruction,
            serializedPayload
        )
    ).toString('hex');

    async function submitTransaction() {
        const payload = serializeForSubmission(instruction, serializedPayload);
        const submitted = (await sendTransaction(payload)).getValue();
        const modifiedProposal: MultiSignatureTransaction = {
            ...proposal,
        };
        if (submitted) {
            modifiedProposal.status = MultiSignatureTransactionStatus.Submitted;
            updateCurrentProposal(dispatch, modifiedProposal);
            getMultiSignatureTransactionStatus(modifiedProposal, dispatch);
            dispatch(
                push({
                    pathname: routes.MULTISIGTRANSACTIONS_SUBMITTED_TRANSACTION,
                    state: stringify(modifiedProposal),
                })
            );
        } else {
            modifiedProposal.status = MultiSignatureTransactionStatus.Failed;
            updateCurrentProposal(dispatch, modifiedProposal);
        }
    }

    async function closeProposal() {
        const closedProposal: MultiSignatureTransaction = {
            ...proposal,
            status: MultiSignatureTransactionStatus.Closed,
        };
        updateCurrentProposal(dispatch, closedProposal);
    }

    const missingSignatures =
        instruction.signatures.length !== proposal.threshold;

    const isOpen = proposal.status === MultiSignatureTransactionStatus.Open;

    return (
        <MultiSignatureLayout
            pageTitle={handler.title}
            stepTitle={`Transaction Proposal - ${handler.type}`}
            closeRoute={CLOSE_ROUTE}
        >
            <CloseProposalModal
                open={showCloseModal}
                onClose={() => setShowCloseModal(false)}
                proposal={proposal}
                onConfirm={async () => {
                    await closeProposal();
                    dispatch(push(CLOSE_ROUTE));
                }}
            />
            <SimpleErrorModal
                show={showError.show}
                header={showError.header}
                content={showError.content}
                onClick={() => setShowError({ show: false })}
            />
            <Form
                formMethods={form}
                onSubmit={submitTransaction}
                className={clsx(styles.body, styles.bodySubtractPadding)}
            >
                <Columns divider columnScroll columnClassName={styles.column}>
                    <Columns.Column header="Transaction Details">
                        <div className={styles.columnContent}>
                            <TransactionDetails transaction={instruction} />
                            <ExpiredEffectiveTimeView
                                transaction={instruction}
                                proposal={proposal}
                            />
                        </div>
                    </Columns.Column>
                    <Columns.Column
                        header="Signatures"
                        className={styles.stretchColumn}
                    >
                        <div className={styles.columnContent}>
                            <div>
                                <h5>
                                    {instruction.signatures.length} of{' '}
                                    {proposal.threshold} signatures.
                                </h5>
                                <SignatureCheckboxes
                                    threshold={proposal.threshold}
                                    signatures={instruction.signatures.map(
                                        (s) => s.signature
                                    )}
                                />
                            </div>
                            <FileInput
                                placeholder="Drag and drop signatures here"
                                buttonTitle="or browse to file"
                                value={files}
                                onChange={setFiles}
                                multiple
                                className={styles.fileInput}
                                disabled={
                                    !missingSignatures || currentlyLoadingFile
                                }
                            />
                        </div>
                    </Columns.Column>
                    <Columns.Column
                        header="Security & Submission Details"
                        className={styles.stretchColumn}
                    >
                        <div className={styles.columnContent}>
                            <div>
                                <TransactionHashView
                                    transactionHash={transactionHash}
                                />
                                <TransactionExpirationDetails
                                    title="Transaction must be submitted before:"
                                    expirationDate={dateFromTimeStamp(
                                        instruction.header.timeout
                                    )}
                                />
                            </div>
                            <div className={styles.actions}>
                                {proposal.status ===
                                    MultiSignatureTransactionStatus.Open && (
                                    <Button
                                        size="small"
                                        className={styles.closeProposalButton}
                                        onClick={() => setShowCloseModal(true)}
                                        danger
                                    >
                                        Close proposal
                                    </Button>
                                )}
                                <Button
                                    className={styles.exportButton}
                                    disabled={!isOpen}
                                    onClick={
                                        () =>
                                            saveFile(
                                                proposal.transaction,
                                                'Export transaction'
                                            )
                                        // TODO Handle failure
                                    }
                                >
                                    Export transaction proposal
                                </Button>
                                <Form.Checkbox
                                    className={styles.finalCheckbox}
                                    name="finalCheck"
                                    rules={{ required: true }}
                                    disabled={!isOpen}
                                >
                                    I understand this is the final submission
                                    and cannot be reverted
                                </Form.Checkbox>
                                <Form.Submit disabled={!isOpen}>
                                    Submit transaction to chain
                                </Form.Submit>
                            </div>
                        </div>
                    </Columns.Column>
                </Columns>
            </Form>
        </MultiSignatureLayout>
    );
}

export default function ProposalViewContainer(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const proposals = useSelector(proposalsSelector);
    const proposal = proposals.find((p) => p.id === parseInt(id, 10));

    if (!proposal) {
        return <Redirect to={routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING} />;
    }

    return <ProposalView proposal={proposal} />;
}
