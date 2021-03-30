import { push } from 'connected-react-router';
import { LocationDescriptorObject } from 'history';
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useParams } from 'react-router';
import ErrorIcon from '@resources/svg/logo-error.svg';
import CheckmarkIcon from '@resources/svg/logo-checkmark.svg';
import {
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
} from '~/utils/types';
import routes from '~/constants/routes.json';
import MultiSignatureLayout from './MultiSignatureLayout';
import Loading from '~/cross-app-components/Loading';
import Button from '~/cross-app-components/Button';
import { BoolResponse } from '~/proto/concordium_p2p_rpc_pb';
import { TransactionHandler } from '~/utils/transactionTypes';
import {
    proposalsSelector,
    updateCurrentProposal,
} from '~/features/MultiSignatureSlice';
import { getMultiSignatureTransactionStatus } from '~/utils/TransactionStatusPoller';

const CLOSE_ROUTE = routes.MULTISIGTRANSACTIONS;

interface LocationState {
    submitPromise: Promise<BoolResponse>;
    handler: TransactionHandler<unknown, unknown>;
}

interface Props {
    location: LocationDescriptorObject<LocationState>;
    proposal: MultiSignatureTransaction;
}

const ERROR_STATUSES = [
    MultiSignatureTransactionStatus.Failed,
    MultiSignatureTransactionStatus.Rejected,
];
const SUCCESS_STATUSES = [MultiSignatureTransactionStatus.Finalized];

function getStatusIcon(status: MultiSignatureTransactionStatus): JSX.Element {
    if (ERROR_STATUSES.some((s) => s === status)) return <ErrorIcon />;
    if (ERROR_STATUSES.some((s) => s === status)) return <CheckmarkIcon />;
    return <Loading inline />;
}

function getStatusText(status: MultiSignatureTransactionStatus): string {
    if (ERROR_STATUSES.some((s) => s === status))
        return 'Transaction unsuccesful. Please try again.';
    if (ERROR_STATUSES.some((s) => s === status))
        return 'Transaction succesful!';
    return 'Waiting for the transaction to finalize.';
}

/**
 * Component that displays a multi signature transaction that has been submitted
 * to a node.
 */
function SubmittedProposalView({ location, proposal }: Props) {
    const dispatch = useDispatch();
    const { status } = proposal;
    const isPending = ![...ERROR_STATUSES, ...SUCCESS_STATUSES].some(
        (s) => s === status
    );

    const { submitPromise, handler } = location.state as LocationState;

    const init = useCallback(async () => {
        const submitted = (await submitPromise).getValue();

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
            disableBack
        >
            <div>
                {getStatusIcon(status)}
                {getStatusText(status)}
            </div>
            <Button
                disabled={isPending}
                onClick={() => {
                    dispatch(push({ pathname: CLOSE_ROUTE }));
                }}
            >
                Finish
            </Button>
        </MultiSignatureLayout>
    );
}

export default function SubmittedProposal(
    props: Omit<Props, 'proposal'>
): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const proposals = useSelector(proposalsSelector);
    const proposal = proposals.find((p) => p.id === parseInt(id, 10));

    // eslint-disable-next-line react/destructuring-assignment
    if (!proposal || !props.location.state) {
        return <Redirect to={CLOSE_ROUTE} />;
    }

    return <SubmittedProposalView {...props} proposal={proposal} />;
}
