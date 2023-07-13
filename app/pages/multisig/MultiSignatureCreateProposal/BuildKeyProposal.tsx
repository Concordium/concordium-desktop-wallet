import React from 'react';
import { FieldValues } from 'react-hook-form';
import { UpdateQueues } from '@concordium/node-sdk';
import { ChainData } from '~/utils/withChainData';
import {
    UpdateType,
    AuthorizationKeysUpdate,
    HigherLevelKeyUpdate,
    MultiSignatureTransaction,
} from '~/utils/types';
import { findUpdateInstructionHandler } from '~/utils/transactionHandlers/HandlerFinder';

import { secondsSinceUnixEpoch } from '~/utils/timeHelpers';

export interface MultiSignatureCreateProposalForm {
    effectiveTime: Date;
    expiryTime: Date;
}

interface Props extends Required<ChainData> {
    defaults: FieldValues;
    updateQueues: UpdateQueues;
    type: UpdateType;
    onFinish: (
        proposal: MultiSignatureTransaction | undefined,
        defaults: FieldValues
    ) => void;
}

export default function BuildProposal({
    type,
    chainParameters,
    updateQueues,
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
        if (!chainParameters) {
            return;
        }
        const effectiveTimeInSeconds = BigInt(
            secondsSinceUnixEpoch(effectiveTime)
        );

        const expiryTimeInSeconds = BigInt(secondsSinceUnixEpoch(expiryTime));
        const newProposal = await handler.createTransaction(
            chainParameters,
            updateQueues,
            keyUpdate,
            effectiveTimeInSeconds,
            expiryTimeInSeconds
        );

        const newDefaults = { effectiveTime, expiryTime, keyUpdate };
        if (newProposal) {
            onFinish(newProposal as MultiSignatureTransaction, newDefaults);
        }
    }

    return (
        <UpdateComponent
            defaults={defaults}
            chainParameters={chainParameters}
            consensusStatus={consensusStatus}
            handleHigherLevelKeySubmit={handleSubmit}
            handleAuthorizationKeySubmit={handleSubmit}
        />
    );
}
