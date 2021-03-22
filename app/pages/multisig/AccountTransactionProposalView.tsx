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
    Transaction,
    instanceOfAccountTransactionWithSignature,
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
        () => transaction.signatures
    );

    async function handleSignatureFile(
        transactionObject: Transaction
    ): Promise<ModalErrorInput | undefined> {
        if (!instanceOfAccountTransactionWithSignature(transactionObject)) {
            return {
                show: true,
                header: 'Invalid signature file',
                content:
                    'The loaded signature file is invalid. It should contain a signature for an account transaction or an update instruction in the exact format exported by this application.',
            };
        }

        if (!currentProposal) {
            return {
                show: true,
                header: 'Unexpected missing current proposal',
            };
        }
        const proposal: AccountTransactionWithSignature = parse(
            currentProposal.transaction
        );

        const credentialIndexList = Object.keys(transactionObject.signatures);
        // We currently restrict the amount of credential signatures imported at the same time to be 1, as it
        // simplifies error handling and currently it is only possible to export a file signed once.
        // This can be expanded to support multiple signatures at a later point in time if need be.
        if (credentialIndexList.length !== 1) {
            return {
                show: true,
                header: 'Invalid signature file',
                content:
                    'The loaded signature file does not contain exactly one credential signature. Multiple signatures or zero signatures are not valid input.',
            };
        }

        const credentialIndex = parseInt(credentialIndexList[0], 10);
        const signature = transactionObject.signatures[credentialIndex];

        console.log(transactionObject);
        console.log(proposal);
        // Prevent the user from adding a signature from a credential that is already present on the proposal.
        if (proposal.signatures[credentialIndex] !== undefined) {
            return {
                show: true,
                header: 'Duplicate Credential',
                content:
                    'The loaded signature file contains a signature, from a credential, which is already has a signature on the proposal.',
            };
        }

        proposal.signatures[credentialIndex] = signature;
        const updatedProposal = {
            ...currentProposal,
            transaction: stringify(proposal),
        };

        updateCurrentProposal(dispatch, updatedProposal);
        return undefined;
    }

    async function submitTransaction() {
        if (!currentProposal) {
            // TODO: can we remove this without getting a type error.
            throw new Error(
                'The proposal page should not be loaded without a proposal in the state.'
            );
        }
        const payload = serializeTransaction(
            transaction,
            () => transaction.signatures
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
            signatures={Object.values(transaction.signatures)}
            handleSignatureFile={handleSignatureFile}
            submitTransaction={submitTransaction}
            currentProposal={currentProposal}
        />
    );
}
