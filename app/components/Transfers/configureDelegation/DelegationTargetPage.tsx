import React from 'react';
import { useForm } from 'react-hook-form';
import Form from '~/components/Form';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { ConfigureDelegationFlowState } from '~/utils/transactionFlows/configureDelegation';
import { EqualRecord, NotOptional } from '~/utils/types';

import styles from './DelegationPage.module.scss';

interface FormState {
    toSpecificPool: boolean;
    poolId?: string;
}

const fieldNames: EqualRecord<NotOptional<FormState>> = {
    toSpecificPool: 'toSpecificPool',
    poolId: 'poolId',
};

type Value = ConfigureDelegationFlowState['target'];
interface Props extends Omit<MultiStepFormPageProps<Value>, 'formValues'> {
    existing?: Value;
}

export default function DelegationTargetPage({
    onNext,
    existing,
    initial = existing,
}: Props) {
    const defaultValues: FormState = {
        toSpecificPool: typeof initial === 'string',
        poolId: initial ?? '',
    };

    const form = useForm<FormState>({ mode: 'onTouched', defaultValues });
    const toSpecificPoolValue = form.watch(fieldNames.toSpecificPool);

    const handleSubmit = ({ toSpecificPool, poolId }: FormState) =>
        onNext(toSpecificPool && poolId !== undefined ? poolId : null);

    return (
        <Form<FormState>
            className={styles.root}
            onSubmit={handleSubmit}
            formMethods={form}
        >
            <div className="flexChildFill">
                <p className="mV30">
                    First you must choose the target you want to delegate to.
                </p>
                {existing !== undefined && (
                    <div className="body3 mono mB10">
                        Current target: {existing ?? 'L-pool'}
                    </div>
                )}
                <Form.Radios
                    name={fieldNames.toSpecificPool}
                    options={[
                        { label: 'Delegate to baker', value: false },
                        { label: 'Delegate to L-pool', value: true },
                    ]}
                />
                {toSpecificPoolValue && (
                    <Form.Input name={fieldNames.poolId} className="mT30" />
                )}
            </div>
            <Form.Submit className={styles.continue}>Continue</Form.Submit>
        </Form>
    );
}
