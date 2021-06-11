import React from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { getDefaultExpiry, TimeConstants } from '~/utils/timeHelpers';
import { ChainData } from '../common/withChainData';
import { UpdateType } from '~/utils/types';
import { findUpdateInstructionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import styles from './MultiSignatureCreateProposal.module.scss';
import Form from '~/components/Form';
import { futureDate, maxDate } from '~/components/Form/util/validation';
import Loading from '~/cross-app-components/Loading';

export interface MultiSignatureCreateProposalForm {
    effectiveTime: Date;
    expiryTime: Date;
}

interface Props extends ChainData {
    defaults: FieldValues;
    type: UpdateType;
    handleSubmit: (
        fields: FieldValues & MultiSignatureCreateProposalForm
    ) => void;
}

export default function BuildProposal({
    type,
    blockSummary,
    consensusStatus,
    handleSubmit,
    defaults,
}: Props) {
    const handler = findUpdateInstructionHandler(type);
    const form = useForm<FieldValues & MultiSignatureCreateProposalForm>({
        mode: 'onTouched',
    });
    const displayType = UpdateType[type];
    const { effectiveTime: effective } = form.watch(['effectiveTime']);
    const UpdateComponent = handler.update;

    return (
        <>
            <h3 className={styles.subHeader}>Transaction details</h3>
            <Form<FieldValues & MultiSignatureCreateProposalForm>
                formMethods={form}
                className={styles.details}
                onSubmit={handleSubmit}
            >
                <div className={styles.proposal}>
                    <p className="mT0">
                        Add all the details for the {displayType} transaction
                        below.
                    </p>
                    {blockSummary && consensusStatus ? (
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
                                    required:
                                        'Transaction expiry time is required',
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
                    ) : (
                        <Loading text="Getting current settings from chain" />
                    )}
                </div>
                <Form.Submit disabled={!blockSummary}>Continue</Form.Submit>
            </Form>
        </>
    );
}
