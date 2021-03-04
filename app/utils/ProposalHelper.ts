import { Dispatch } from '@reduxjs/toolkit';
import { parse } from 'json-bigint';
import { updateCurrentProposal } from '../features/MultiSignatureSlice';
import { getNow } from './timeHelpers';
import {
    MultiSignatureTransaction,
    MultiSignatureTransactionStatus,
    TimeStampUnit,
    UpdateInstruction,
    UpdateInstructionPayload,
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
        const updateInstruction: UpdateInstruction<UpdateInstructionPayload> = parse(
            proposal.transaction
        );
        const expiration = updateInstruction.header.timeout;

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
