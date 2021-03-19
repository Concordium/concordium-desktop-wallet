import { Dispatch } from '@reduxjs/toolkit';
import { parse } from './JSONHelper';
import { updateCurrentProposal } from '../features/MultiSignatureSlice';
import { getNow } from './timeHelpers';
import { getTimeout } from './transactionHelpers';
import {
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    TimeStampUnit,
    Transaction,
} from './types';

/**
 * Effect for awaiting the expiration of a proposal. If the proposal expires, then the proposal
 * is set to failed and updated in the database and the state.
 */
export default function expirationEffect(
    proposal: MultiSignatureTransaction,
    dispatch: Dispatch
) {
    if (proposal.status === MultiSignatureTransactionStatus.Open) {
        const transaction: Transaction = parse(proposal.transaction);

        const expiration = getTimeout(transaction);

        const interval = setInterval(async () => {
            if (expiration <= BigInt(getNow(TimeStampUnit.seconds))) {
                const expiredProposal = {
                    ...proposal,
                    status: MultiSignatureTransactionStatus.Expired,
                };
                await updateCurrentProposal(dispatch, expiredProposal);
                clearInterval(interval);
            }
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }
    return () => {};
}
