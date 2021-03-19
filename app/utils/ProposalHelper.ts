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
 * Update the proposal to expired if now() is later than the expiration time. The function
 * returns true if the proposal was expired, otherwise false.
 */
async function expire(
    proposal: MultiSignatureTransaction,
    expiration: bigint,
    dispatch: Dispatch
): Promise<boolean> {
    if (expiration <= BigInt(getNow(TimeStampUnit.seconds))) {
        const expiredProposal = {
            ...proposal,
            status: MultiSignatureTransactionStatus.Expired,
        };
        await updateCurrentProposal(dispatch, expiredProposal);
        return true;
    }
    return false;
}

/**
 * Effect for awaiting the expiration of a proposal. If the proposal expires, then the proposal
 * is set to failed and updated in the database and the state.
 */
export function expirationEffect(
    proposal: MultiSignatureTransaction,
    dispatch: Dispatch
) {
    if (proposal.status === MultiSignatureTransactionStatus.Open) {
        const transaction: Transaction = parse(proposal.transaction);

        const expiration = getTimeout(transaction);

        if (expiration <= BigInt(getNow(TimeStampUnit.seconds))) {
            expire(proposal, expiration, dispatch);
            return () => {};
        }

        const interval = setInterval(async () => {
            const expiredInInterval = await expire(
                proposal,
                expiration,
                dispatch
            );
            if (expiredInInterval) {
                clearInterval(interval);
            }
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }
    return () => {};
}

/**
 * Function that listens for expiration of open proposals and marks them as expired.
 * The function also returns a cleanup function, which is meant to be used as a
 * useEffect() cleanup callback function.
 */
export function expireProposals(
    proposals: MultiSignatureTransaction[],
    dispatch: Dispatch
) {
    const cleanUpFunctions: (() => void)[] = [];
    proposals.forEach(async (multiSigProposal) => {
        cleanUpFunctions.push(expirationEffect(multiSigProposal, dispatch));
    });
    return () => {
        cleanUpFunctions.forEach((cleanUp) => cleanUp());
    };
}
