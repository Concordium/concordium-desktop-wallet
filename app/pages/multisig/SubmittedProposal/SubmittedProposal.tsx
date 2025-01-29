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
import {
    getNextAccountNonce,
    sendAccountTransaction,
    sendUpdateInstruction,
} from '~/node/nodeRequests';
import findHandler, {
    findUpdateInstructionHandler,
} from '~/utils/transactionHandlers/HandlerFinder';
import SimpleErrorModal, {
    ModalErrorInput,
} from '~/components/SimpleErrorModal';
import { attachKeyIndex } from '~/utils/updates/AuthorizationHelper';
import withChainData, { ChainData } from '~/utils/withChainData';
import TransactionHashView from '~/components/TransactionHash';
import { throwLoggedError } from '~/utils/basicHelpers';

import styles from './SubmittedProposal.module.scss';

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
    ({ proposal, chainParameters }) => {
        const dispatch = useDispatch();
        const [showError, setShowError] = useState<ModalErrorInput>({
            show: false,
        });

        const { status, transaction: transactionJSON } = proposal;
        const transaction: Transaction = parse(transactionJSON);

        const handler = findHandler(transaction);

        const isPending = [...ERROR_STATUSES, ...SUCCESS_STATUSES].every(
            (s) => s !== status
        );

        // eslint-disable-next-line no-shadow
        const init = useCallback(async (chainParameters) => {
            let submitted;
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
                                chainParameters,
                                transaction,
                                updateHandler
                            )
                        )
                    );
                    submitted = await sendUpdateInstruction(
                        transaction,
                        signatures,
                        serializedPayload
                    );
                } catch (error) {
                    setShowError({
                        show: true,
                        header: 'Unauthorized key',
                        content: (error as Error).message,
                    });
                    return;
                }
            } else if (instanceOfAccountTransactionWithSignature(transaction)) {
                const nextNonce = await getNextAccountNonce(transaction.sender);
                const difference =
                    nextNonce.nonce.value - BigInt(transaction.nonce);

                if (difference === 0n) {
                    submitted = await sendAccountTransaction(
                        transaction,
                        transaction.signatures
                    );
                } else if (difference > 0n) {
                    setShowError({
                        show: true,
                        header: 'Incorrect nonce',
                        content:
                            'Transaction contains an already used nonce, the transaction has been cancelled.',
                    });
                    /**
                     * Updates the multi signature transaction in the database, and updates the
                     * state with the updated transaction.
                     */
                    updateCurrentProposal(dispatch, {
                        ...proposal,
                        status: MultiSignatureTransactionStatus.Closed,
                    });
                    return;
                } else {
                    setShowError({
                        show: true,
                        header: 'Incorrect nonce',
                        content: `Transaction has nonce ${transaction.nonce}, but the next expected nonce is ${nextNonce.nonce}.`,
                    });
                    return;
                }
            } else {
                throwLoggedError(`Unexpected Transaction type: ${transaction}`);
            }
            const modifiedProposal: MultiSignatureTransaction = {
                ...proposal,
            };
            if (submitted) {
                window.log.info(
                    `Successfully Sent Proposal. Id: ${proposal.id}`
                );
                modifiedProposal.status =
                    MultiSignatureTransactionStatus.Submitted;
                updateCurrentProposal(dispatch, modifiedProposal);
                getMultiSignatureTransactionStatus(modifiedProposal, dispatch);
            } else {
                window.log.warn(
                    `Sent Proposal was rejected by node. Id: ${proposal.id}`
                );
                modifiedProposal.status =
                    MultiSignatureTransactionStatus.Failed;
                updateCurrentProposal(dispatch, modifiedProposal);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        useEffect(() => {
            if (chainParameters) {
                init(chainParameters);
            }
        }, [init, chainParameters]);

        return (
            <MultiSignatureLayout pageTitle={handler.title} disableBack>
                <SimpleErrorModal
                    show={showError.show}
                    header={showError.header}
                    content={showError.content}
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
