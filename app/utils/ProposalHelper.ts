import { Dispatch } from '@reduxjs/toolkit';
import { parse } from 'json-bigint';
import {
    setProposals,
    updateCurrentProposal,
} from '../features/MultiSignatureSlice';
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
 * @param proposal if supplied the total list of proposals in the state will also be updated
 */
export default function expirationEffect(
    proposal: MultiSignatureTransaction,
    dispatch: Dispatch,
    proposals?: MultiSignatureTransaction[]
) {
    if (proposal.status === MultiSignatureTransactionStatus.Open) {
        const updateInstruction: UpdateInstruction<UpdateInstructionPayload> = parse(
            proposal.transaction
        );
        const expiration = updateInstruction.header.timeout;

        const interval = setInterval(async () => {
            if (expiration <= BigInt(getNow(TimeStampUnit.seconds))) {
                const failedProposal = {
                    ...proposal,
                    status: MultiSignatureTransactionStatus.Failed,
                };
                await updateCurrentProposal(dispatch, failedProposal);

                if (proposals) {
                    const newProposals = proposals.map((prop) => {
                        if (prop.id === failedProposal.id) {
                            return failedProposal;
                        }
                        return prop;
                    });
                    dispatch(setProposals(newProposals));
                }
                // await loadProposals(dispatch);
                clearInterval(interval);
            }
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }
    return () => {};
}
