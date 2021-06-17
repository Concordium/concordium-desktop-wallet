import { push } from 'connected-react-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useParams } from 'react-router';
import ErrorIcon from '@resources/svg/logo-error.svg';
import CheckmarkIcon from '@resources/svg/logo-checkmark.svg';
import { parse } from '~/utils/JSONHelper';
import {
    instanceOfAccountTransactionWithSignature,
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    instanceOfUpdateInstruction,
    Transaction,
} from '~/utils/types';
import routes from '~/constants/routes.json';
import MultiSignatureLayout from '../MultiSignatureLayout';
import Loading from '~/cross-app-components/Loading';
import Button from '~/cross-app-components/Button';
import {
    proposalsSelector,
    updateCurrentProposal,
} from '~/features/MultiSignatureSlice';
import { getMultiSignatureTransactionStatus } from '~/utils/TransactionStatusPoller';
import styles from './SubmittedProposal.module.scss';
import { sendTransaction } from '~/node/nodeRequests';
import findHandler, {
    findUpdateInstructionHandler,
} from '~/utils/transactionHandlers/HandlerFinder';
import { serializeForSubmission } from '~/utils/UpdateSerialization';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import { serializeTransaction } from '~/utils/transactionSerialization';
import { attachKeyIndex } from '~/utils/updates/AuthorizationHelper';
import withChainData, { ChainData } from '../common/withChainData';
import TransactionHashView from '~/components/TransactionHash';

const CLOSE_ROUTE = routes.MULTISIGTRANSACTIONS;

interface Props extends ChainData {
    proposal: MultiSignatureTransaction;
}

const ERROR_STATUSES = [
    MultiSignatureTransactionStatus.Failed,
    MultiSignatureTransactionStatus.Rejected,
];
const SUCCESS_STATUSES = [MultiSignatureTransactionStatus.Finalized];

function getStatusIcon(status: MultiSignatureTransactionStatus): JSX.Element {
    if (ERROR_STATUSES.includes(status)) {
        return <ErrorIcon className={styles.icon} />;
    }
    if (SUCCESS_STATUSES.includes(status)) {
        return <CheckmarkIcon className={styles.icon} />;
    }
    return <Loading inline className={styles.icon} />;
}

function getStatusText(status: MultiSignatureTransactionStatus): string {
    if (ERROR_STATUSES.includes(status)) {
        return 'Transaction unsuccesful. Please try again.';
    }
    if (SUCCESS_STATUSES.includes(status)) {
        return 'Transaction succesful!';
    }
    return 'Waiting for the transaction to finalize.';
}

/**
 * Component that displays a multi signature transaction that has been submitted
 * to a node.
 */

const SubmittedProposalView = withChainData<Props>(
    ({ proposal, blockSummary }) => {
        const dispatch = useDispatch();
        const [validationError, setValidationError] = useState<string>();

        const { status, transaction: transactionJSON } = proposal;
        const transaction: Transaction = parse(transactionJSON);

        const handler = findHandler(transaction);

        const isPending = [...ERROR_STATUSES, ...SUCCESS_STATUSES].every(
            (s) => s !== status
        );

        // eslint-disable-next-line no-shadow
        const init = useCallback(async (blockSummary) => {
            let payload;
            if (instanceOfUpdateInstruction(transaction)) {
                const updateHandler = findUpdateInstructionHandler(
                    transaction.type
                );
                const serializedPayload = updateHandler.serializePayload(
                    transaction
                );
                try {
                    const signatures = await Promise.all(
                        transaction.signatures.map((sig) =>
                            attachKeyIndex(
                                sig,
                                blockSummary,
                                transaction,
                                updateHandler
                            )
                        )
                    );
                    payload = serializeForSubmission(
                        transaction,
                        signatures,
                        serializedPayload
                    );
                } catch (error) {
                    setValidationError(error.message);
                    return;
                }
            } else if (instanceOfAccountTransactionWithSignature(transaction)) {
                payload = serializeTransaction(
                    transaction,
                    transaction.signatures
                );
            } else {
                throw new Error(`Unexpected Transaction type: ${transaction}`);
            }
            const submitted = (await sendTransaction(payload)).getValue();
            const modifiedProposal: MultiSignatureTransaction = {
                ...proposal,
            };
            if (submitted) {
                modifiedProposal.status =
                    MultiSignatureTransactionStatus.Submitted;
                updateCurrentProposal(dispatch, modifiedProposal);
                getMultiSignatureTransactionStatus(modifiedProposal, dispatch);
            } else {
                modifiedProposal.status =
                    MultiSignatureTransactionStatus.Failed;
                updateCurrentProposal(dispatch, modifiedProposal);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        useEffect(() => {
            if (blockSummary) {
                init(blockSummary);
            }
        }, [init, blockSummary]);

        return (
            <MultiSignatureLayout
                pageTitle={handler.title}
                stepTitle={`Transaction Proposal - ${handler.type}`}
                disableBack
            >
                <SimpleErrorModal
                    show={Boolean(validationError)}
                    header="Unauthorized key"
                    content={validationError}
                    onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
                />
                <div className={styles.body}>
                    <div />
                    <div className={styles.status}>
                        {getStatusIcon(status)}
                        {getStatusText(status)}
                        <TransactionHashView transaction={transaction} />
                    </div>
                    <Button
                        className={styles.button}
                        disabled={isPending}
                        onClick={() => {
                            dispatch(push({ pathname: CLOSE_ROUTE }));
                        }}
                    >
                        Finish
                    </Button>
                </div>
            </MultiSignatureLayout>
        );
    }
);

export default function SubmittedProposal(
    props: Omit<Props, 'proposal'>
): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const proposals = useSelector(proposalsSelector);
    const proposal = proposals.find((p) => p.id === parseInt(id, 10));

    if (!proposal) {
        return <Redirect to={CLOSE_ROUTE} />;
    }

    return <SubmittedProposalView {...props} proposal={proposal} />;
}
