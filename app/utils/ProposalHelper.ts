import { Dispatch } from '@reduxjs/toolkit';
import { updateCurrentProposal } from '../features/MultiSignatureSlice';
import { getNow } from './timeHelpers';
import {
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    TimeStampUnit,
} from './types';

/**
 * Effect for awaiting the expiration of a proposal. If the proposal expires, then the proposal
 * is set to failed and updated in the database.
 */
export default function expirationEffect(
    expiration: bigint,
    proposal: MultiSignatureTransaction,
    dispatch: Dispatch
) {
    if (proposal.status === MultiSignatureTransactionStatus.Open) {
        const interval = setInterval(async () => {
            if (expiration <= BigInt(getNow(TimeStampUnit.seconds))) {
                const failedProposal = {
                    ...proposal,
                    status: MultiSignatureTransactionStatus.Failed,
                };
                await updateCurrentProposal(dispatch, failedProposal);
                clearInterval(interval);
            }
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }
    return () => {};
}
