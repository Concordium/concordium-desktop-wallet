import { push } from 'connected-react-router';
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useParams } from 'react-router';
import ErrorIcon from '@resources/svg/logo-error.svg';
import CheckmarkIcon from '@resources/svg/logo-checkmark.svg';
import { parse } from 'json-bigint';
import {
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
import { sendTransaction } from '~/utils/nodeRequests';
import { findUpdateInstructionHandler } from '~/utils/updates/HandlerFinder';
import { serializeForSubmission } from '~/utils/UpdateSerialization';

const CLOSE_ROUTE = routes.MULTISIGTRANSACTIONS;

interface Props {
    proposal: MultiSignatureTransaction;
}

const ERROR_STATUSES = [
    MultiSignatureTransactionStatus.Failed,
    MultiSignatureTransactionStatus.Rejected,
];
const SUCCESS_STATUSES = [MultiSignatureTransactionStatus.Finalized];

function getStatusIcon(status: MultiSignatureTransactionStatus): JSX.Element {
    if (ERROR_STATUSES.some((s) => s === status))
        return <ErrorIcon className={styles.icon} />;
    if (SUCCESS_STATUSES.some((s) => s === status))
        return <CheckmarkIcon className={styles.icon} />;
    return <Loading inline className={styles.icon} />;
}

function getStatusText(status: MultiSignatureTransactionStatus): string {
    if (ERROR_STATUSES.some((s) => s === status))
        return 'Transaction unsuccesful. Please try again.';
    if (SUCCESS_STATUSES.some((s) => s === status))
        return 'Transaction succesful!';
    return 'Waiting for the transaction to finalize.';
}

/**
 * Component that displays a multi signature transaction that has been submitted
 * to a node.
 */
function SubmittedProposalView({ proposal }: Props) {
    const dispatch = useDispatch();
    const { status, transaction: transactionJSON } = proposal;
    const transaction: Transaction = parse(transactionJSON);
    if (!instanceOfUpdateInstruction(transaction)) {
        throw new Error('not supported');
    }

    const handler = findUpdateInstructionHandler(transaction.type);
    const serializedPayload = handler.serializePayload(transaction);

    const isPending = [...ERROR_STATUSES, ...SUCCESS_STATUSES].every(
        (s) => s !== status
    );

    const init = useCallback(async () => {
        const payload = serializeForSubmission(transaction, serializedPayload);
        const submitted = (await sendTransaction(payload)).getValue();

        const modifiedProposal: MultiSignatureTransaction = {
            ...proposal,
        };
        if (submitted) {
            modifiedProposal.status = MultiSignatureTransactionStatus.Submitted;
            updateCurrentProposal(dispatch, modifiedProposal);
            getMultiSignatureTransactionStatus(modifiedProposal, dispatch);
        } else {
            modifiedProposal.status = MultiSignatureTransactionStatus.Failed;
            updateCurrentProposal(dispatch, modifiedProposal);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        init();
    }, [init]);

    return (
        <MultiSignatureLayout
            pageTitle={handler.title}
            stepTitle={`Transaction Proposal - ${handler.type}`}
        >
            <div className={styles.body}>
                <div />
                <div className={styles.status}>
                    {getStatusIcon(status)}
                    {getStatusText(status)}
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
