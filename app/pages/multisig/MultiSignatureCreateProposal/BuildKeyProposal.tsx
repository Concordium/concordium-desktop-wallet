import React from 'react';
import { FieldValues } from 'react-hook-form';
import { ChainData } from '../common/withChainData';
import {
    UpdateType,
    AuthorizationKeysUpdate,
    HigherLevelKeyUpdate,
    MultiSignatureTransaction,
} from '~/utils/types';
import { findUpdateInstructionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import Loading from '~/cross-app-components/Loading';

import { secondsSinceUnixEpoch } from '~/utils/timeHelpers';

export interface MultiSignatureCreateProposalForm {
    effectiveTime: Date;
    expiryTime: Date;
}

interface Props extends ChainData {
    defaults: FieldValues;
    type: UpdateType;
    onFinish: (
        proposal: Partial<MultiSignatureTransaction>,
        defaults: FieldValues
    ) => void;
}

export default function BuildProposal({
    type,
    blockSummary,
    consensusStatus,
    onFinish,
    defaults,
}: Props) {
    const handler = findUpdateInstructionHandler(type);
    const UpdateComponent = handler.update;

    /**
     * Form submit function used for the higher level keys updates. They do not
     * use Form element to input all the keys, so therefore it cannot use the
     * regular handleSubmit function.
     */
    async function handleSubmit(
        effectiveTime: Date,
        expiryTime: Date,
        keyUpdate:
            | Partial<HigherLevelKeyUpdate>
            | Partial<AuthorizationKeysUpdate>
    ) {
        if (!blockSummary) {
            return;
        }
        const effectiveTimeInSeconds = BigInt(
            secondsSinceUnixEpoch(effectiveTime)
        );

        const expiryTimeInSeconds = BigInt(secondsSinceUnixEpoch(expiryTime));
        const newProposal = await handler.createTransaction(
            blockSummary,
            keyUpdate,
            effectiveTimeInSeconds,
            expiryTimeInSeconds
        );

        const newDefaults = { effectiveTime, expiryTime, keyUpdate };
        if (newProposal) {
            onFinish(newProposal, newDefaults);
        }
    }

    return (
        <>
            {(!blockSummary || !consensusStatus) && (
                <Loading text="Getting current settings from chain" />
            )}
            {blockSummary && consensusStatus && (
                <UpdateComponent
                    defaults={defaults}
                    blockSummary={blockSummary}
                    consensusStatus={consensusStatus}
                    handleHigherLevelKeySubmit={handleSubmit}
                    handleAuthorizationKeySubmit={handleSubmit}
                />
            )}
        </>
    );
}
