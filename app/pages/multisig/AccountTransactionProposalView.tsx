import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { useParams } from 'react-router';
import { parse, stringify } from '../../utils/JSONHelper';
import {
    proposalsSelector,
    updateCurrentProposal,
} from '../../features/MultiSignatureSlice';
import {
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    AccountTransactionWithSignature,
} from '../../utils/types';
import { sendTransaction } from '../../utils/nodeRequests';
import { getMultiSignatureTransactionStatus } from '../../utils/TransactionStatusPoller';
import routes from '../../constants/routes.json';
import { findAccountTransactionHandler } from '../../utils/updates/HandlerFinder';
import {
    getAccountTransactionHash,
    serializeTransaction,
} from '../../utils/transactionSerialization';
import ProposalView from './ProposalView';
import { ModalErrorInput } from '../../components/SimpleErrorModal';

/**
 * Component that displays the multi signature transaction proposal that is currently the
 * active one in the state.
 * This handles the Account Transaction specific behaviour.
 */
export default function AccountTransactionProposalView() {
    const dispatch = useDispatch();
    const { id } = useParams<{ id: string }>();
    const proposals = useSelector(proposalsSelector);
    const currentProposal = proposals.find((p) => p.id === parseInt(id, 10));

    if (!currentProposal) {
        throw new Error(
            'The proposal page should not be loaded without a proposal in the state.'
        );
    }

    const transaction: AccountTransactionWithSignature = parse(
        currentProposal.transaction
    );

    const handler = findAccountTransactionHandler(transaction.transactionKind);
    const transactionHash = getAccountTransactionHash(
        transaction,
        () => transaction.signature
    );

    async function handleSignatureFile(): Promise<ModalErrorInput | undefined> {
        return {
            show: true,
            header: 'Not Implemented',
            content:
                'Importing credential signatures have not been implemented yet',
        };
    }

    async function submitTransaction() {
        if (!currentProposal) {
            // TODO: can we remove this without getting a type error.
            throw new Error(
                'The proposal page should not be loaded without a proposal in the state.'
            );
        }
        console.log('test');
        const payload = serializeTransaction(
            transaction,
            () => transaction.signature
        );
        const submitted = (await sendTransaction(payload)).getValue();
        const modifiedProposal: MultiSignatureTransaction = {
            ...currentProposal,
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

    return (
        <ProposalView
            title={handler.title}
            transaction={transaction}
            transactionHash={transactionHash.toString('hex')}
            signatures={Object.values(transaction.signature)}
            handleSignatureFile={handleSignatureFile}
            submitTransaction={submitTransaction}
            currentProposal={currentProposal}
        />
    );
}
