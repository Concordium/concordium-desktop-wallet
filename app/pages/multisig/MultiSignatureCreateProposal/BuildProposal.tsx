import React from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import {
    getDefaultExpiry,
    TimeConstants,
    secondsSinceUnixEpoch,
} from '~/utils/timeHelpers';
import { ChainData } from '../common/withChainData';
import { UpdateType, MultiSignatureTransaction } from '~/utils/types';
import { findUpdateInstructionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import styles from './MultiSignatureCreateProposal.module.scss';
import Form from '~/components/Form';
import { futureDate, maxDate } from '~/components/Form/util/validation';

export interface MultiSignatureCreateProposalForm {
    effectiveTime: Date;
    expiryTime: Date;
}

interface Props extends Required<ChainData> {
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
    const form = useForm<FieldValues & MultiSignatureCreateProposalForm>({
        mode: 'onTouched',
    });
    const displayType = UpdateType[type];
    const { effectiveTime: effective } = form.watch(['effectiveTime']);
    const UpdateComponent = handler.update;

    async function handleProposalSubmit(
        fields: FieldValues & MultiSignatureCreateProposalForm
    ): Promise<void> {
        const { effectiveTime, expiryTime, ...dynamicFields } = fields;
        const effectiveTimeInSeconds = BigInt(
            secondsSinceUnixEpoch(effectiveTime)
        );
        const expiryTimeInSeconds = BigInt(secondsSinceUnixEpoch(expiryTime));

        const newProposal = await handler.createTransaction(
            blockSummary,
            dynamicFields,
            effectiveTimeInSeconds,
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
                        Add all the details for the {displayType} transaction
                        below.
                    </p>
                    <>
                        <UpdateComponent
                            defaults={defaults}
                            blockSummary={blockSummary}
                            consensusStatus={consensusStatus}
                        />
                        <Form.Timestamp
                            name="effectiveTime"
                            label="Effective Time"
                            defaultValue={
                                defaults.effectiveTime ||
                                new Date(
                                    getDefaultExpiry().getTime() +
                                        5 * TimeConstants.Minute
                                )
                            }
                            rules={{
                                required: 'Effective time is required',
                                validate: futureDate(
                                    'Effective time must be in the future'
                                ),
                            }}
                        />
                        <Form.Timestamp
                            name="expiryTime"
                            label="Transaction Expiry Time"
                            defaultValue={
                                defaults.expiryTime || getDefaultExpiry()
                            }
                            rules={{
                                required: 'Transaction expiry time is required',
                                validate: {
                                    ...(effective !== undefined
                                        ? {
                                              beforeEffective: maxDate(
                                                  effective,
                                                  'Transaction expiry time must be before the effective time'
                                              ),
                                          }
                                        : undefined),
                                    future: futureDate(
                                        'Transaction expiry time must be in the future'
                                    ),
                                },
                            }}
                        />
                    </>
                </div>
                <Form.Submit disabled={!blockSummary}>Continue</Form.Submit>
            </Form>
        </>
    );
}
