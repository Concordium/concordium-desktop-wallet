import React, { useEffect } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { NextUpdateSequenceNumbers } from '@concordium/web-sdk';
import {
    getDefaultExpiry,
    TimeConstants,
    secondsSinceUnixEpoch,
} from '~/utils/timeHelpers';
import { ChainData } from '~/utils/withChainData';
import { UpdateType, MultiSignatureTransaction } from '~/utils/types';
import { findUpdateInstructionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import Form from '~/components/Form';
import { futureDate, maxDate } from '~/components/Form/util/validation';

import styles from './MultiSignatureCreateProposal.module.scss';

export interface MultiSignatureCreateProposalForm {
    effectiveTime?: Date;
    expiryTime: Date;
}

interface Props extends Required<ChainData> {
    defaults: FieldValues;
    nextUpdateSequenceNumbers: NextUpdateSequenceNumbers;
    type: UpdateType;
    onFinish: (
        proposal: Omit<MultiSignatureTransaction, 'id'> | undefined,
        defaults: FieldValues
    ) => void;
    // Whether the chain update tx is enqueued and hence has an effective time.
    hasEffectiveTime: boolean;
}

export default function BuildProposal({
    type,
    chainParameters,
    nextUpdateSequenceNumbers,
    consensusStatus,
    onFinish,
    defaults,
    hasEffectiveTime,
}: Props) {
    const defaultEffective =
        defaults.effectiveTime ||
        new Date(getDefaultExpiry().getTime() + 5 * TimeConstants.Minute);
    const handler = findUpdateInstructionHandler(type);
    const form = useForm<FieldValues & MultiSignatureCreateProposalForm>({
        mode: 'onTouched',
    });
    const { effectiveTime: effective = defaultEffective } = form.watch([
        'effectiveTime',
    ]);
    const UpdateComponent = handler.update;

    useEffect(() => {
        form.trigger('expiryTime');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effective]);

    async function handleProposalSubmit(
        fields: FieldValues & MultiSignatureCreateProposalForm
    ): Promise<void> {
        const { effectiveTime, expiryTime, ...dynamicFields } = fields;
        const expiryTimeInSeconds = BigInt(secondsSinceUnixEpoch(expiryTime));

        const newProposal = await handler.createTransaction(
            chainParameters,
            nextUpdateSequenceNumbers,
            dynamicFields,
            // If the chain update tx takes effect immediately
            // (no effective time exists as the chain update tx is NOT enqueued),
            // the default value 0 is used in that case.
            effectiveTime ? BigInt(secondsSinceUnixEpoch(effectiveTime)) : 0n,
            expiryTimeInSeconds
        );

        if (newProposal) {
            onFinish(newProposal, fields);
        }
    }

    return (
        <>
            <h3 className={styles.subHeader}>Transaction details</h3>
            <Form<FieldValues & MultiSignatureCreateProposalForm>
                formMethods={form}
                className={styles.details}
                onSubmit={handleProposalSubmit}
            >
                <div className={styles.proposal}>
                    <p className="mT0">
                        Add all the details for the transaction below.
                    </p>
                    <>
                        <UpdateComponent
                            defaults={defaults}
                            chainParameters={chainParameters}
                            consensusStatus={consensusStatus}
                        />
                        {hasEffectiveTime && (
                            <Form.DatePicker
                                className="body2 mV40"
                                name="effectiveTime"
                                label="Effective time"
                                defaultValue={defaultEffective}
                                rules={{
                                    required: 'Effective time is required',
                                    validate: futureDate(
                                        'Effective time must be in the future'
                                    ),
                                }}
                                minDate={new Date()}
                            />
                        )}
                        <Form.DatePicker
                            className="body2 mV40"
                            name="expiryTime"
                            label="Transaction expiry time"
                            defaultValue={
                                defaults.expiryTime || getDefaultExpiry()
                            }
                            rules={{
                                required: 'Transaction expiry time is required',
                                validate: {
                                    beforeEffective: maxDate(
                                        effective,
                                        'Transaction expiry time must be before the effective time'
                                    ),
                                    future: futureDate(
                                        'Transaction expiry time must be in the future'
                                    ),
                                },
                            }}
                            minDate={new Date()}
                            maxDate={effective}
                        />
                    </>
                </div>
                <Form.Submit disabled={!chainParameters}>Continue</Form.Submit>
            </Form>
        </>
    );
}
