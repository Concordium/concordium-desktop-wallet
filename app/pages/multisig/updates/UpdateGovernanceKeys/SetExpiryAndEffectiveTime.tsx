import React from 'react';
import { useForm } from 'react-hook-form';
import { addMinutes } from 'date-fns';
import Form from '~/components/Form';
import { futureDate, maxDate } from '~/components/Form/util/validation';
import { getDefaultExpiry, isDateEqual } from '~/utils/timeHelpers';

export interface MultiSignatureCreateProposalForm {
    effectiveTime: Date;
    expiryTime: Date;
}

interface Props {
    defaults: Partial<MultiSignatureCreateProposalForm>;
    onContinue(expiry: Date, effectiveTime: Date): void;
}

/**
 * Component for displaying the current signature threshold for the key set, and for
 * letting the user input an updated signature threshold.
 */
export default function SetExpiryAndEffectiveTime({
    defaults,
    onContinue,
}: Props) {
    const form = useForm<MultiSignatureCreateProposalForm>({
        mode: 'onTouched',
        defaultValues: {
            effectiveTime:
                defaults.effectiveTime || addMinutes(getDefaultExpiry(), 5),
            expiryTime: defaults.expiryTime || getDefaultExpiry(),
        },
    });
    const { effectiveTime, expiryTime } = form.watch([
        'effectiveTime',
        'expiryTime',
    ]);

    async function handleSubmit(
        fields: MultiSignatureCreateProposalForm
    ): Promise<void> {
        const { effectiveTime: effective, expiryTime: expiry } = fields;
        onContinue(effective, expiry);
    }

    return (
        <Form
            formMethods={form}
            onSubmit={handleSubmit}
            className="displayContents"
        >
            <div>
                <h3>Choose effective time and expiry of the update</h3>
                <Form.DatePicker
                    name="effectiveTime"
                    label="Effective Time"
                    className="mV40"
                    rules={{
                        required: 'Effective time is required',
                        validate: futureDate(
                            'Effective time must be in the future'
                        ),
                    }}
                    minDate={new Date()}
                    minTime={new Date()}
                />
                <Form.DatePicker
                    name="expiryTime"
                    label="Transaction Expiry Time"
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
                    minDate={effectiveTime ?? new Date()}
                    minTime={
                        effectiveTime &&
                        expiryTime &&
                        isDateEqual(effectiveTime, expiryTime)
                            ? effectiveTime
                            : undefined
                    }
                />
            </div>
            <Form.Submit>Continue</Form.Submit>
        </Form>
    );
}
