import React from 'react';
import { useForm } from 'react-hook-form';
import Form from '~/components/Form';
import { futureDate, maxDate } from '~/components/Form/util/validation';
import { getDefaultExpiry, TimeConstants } from '~/utils/timeHelpers';

interface Props {
    onContinue(expiry: Date, effectiveTime: Date): void;
}

export interface MultiSignatureCreateProposalForm {
    effectiveTime: Date;
    expiry: Date;
}

/**
 * Component for displaying the current signature threshold for the key set, and for
 * letting the user input an updated signature threshold.
 */
export default function SetExpiryAndEffectiveTime({ onContinue }: Props) {
    const form = useForm<MultiSignatureCreateProposalForm>({
        mode: 'onTouched',
    });
    const { effectiveTime } = form.watch(['effectiveTime']);

    async function handleSubmit(
        fields: MultiSignatureCreateProposalForm
    ): Promise<void> {
        const { effectiveTime: effective, expiry } = fields;
        onContinue(effective, expiry);
    }

    return (
        <Form formMethods={form} onSubmit={handleSubmit}>
            <div>
                <h3>Choose effective time and expiry of the update</h3>
                <Form.Timestamp
                    name="effectiveTime"
                    label="Effective Time"
                    defaultValue={
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
                    name="expiry"
                    label="Transaction Expiry Time"
                    defaultValue={getDefaultExpiry()}
                    rules={{
                        required: 'Transaction expiry time is required',
                        validate: {
                            ...(effectiveTime !== undefined
                                ? {
                                      beforeEffective: maxDate(
                                          effectiveTime,
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
            </div>
            <Form.Submit>Continue</Form.Submit>
        </Form>
    );
}
