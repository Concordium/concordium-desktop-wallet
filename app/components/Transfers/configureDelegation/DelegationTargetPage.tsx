import React from 'react';
import { useForm } from 'react-hook-form';
import Form from '~/components/Form';
import { validBigInt } from '~/components/Form/util/validation';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import {
    ConfigureDelegationFlowState,
    getExistingDelegationValues,
} from '~/utils/transactionFlows/configureDelegation';
import { AccountInfo, EqualRecord, NotOptional } from '~/utils/types';

import styles from './DelegationPage.module.scss';

interface FormState {
    toSpecificPool: boolean;
    poolId?: string;
}

const fieldNames: EqualRecord<NotOptional<FormState>> = {
    toSpecificPool: 'toSpecificPool',
    poolId: 'poolId',
};

interface Props
    extends Omit<
        MultiStepFormPageProps<
            NotOptional<ConfigureDelegationFlowState>['target']
        >,
        'formValues'
    > {
    accountInfo: AccountInfo;
}

export default function DelegationTargetPage({
    onNext,
    accountInfo,
    initial,
}: Props) {
    const { target: existing } = getExistingDelegationValues(accountInfo) ?? {};
    const defaultValue = initial ?? existing;
    const defaultValues: FormState = {
        toSpecificPool: typeof defaultValue === 'string',
        poolId: defaultValue ?? '',
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
                    className="mT50"
                    name={fieldNames.toSpecificPool}
                    options={[
                        { label: 'Delegate to baker', value: true },
                        { label: 'Delegate to L-pool', value: false },
                    ]}
                />
                {toSpecificPoolValue && (
                    <Form.Input
                        name={fieldNames.poolId}
                        className="mT30 body2"
                        placeholder="Enter baker ID"
                        rules={{
                            required: 'Baker ID must be specified',
                            min: {
                                value: 0,
                                message: "Baker ID's cannot be negative",
                            },
                            validate: {
                                wholeNumber: validBigInt(
                                    "Baker ID's are positive whole numbers"
                                ),
                                // TODO check if baker ID exists.
                            },
                        }}
                    />
                )}
            </div>
            <Form.Submit className={styles.continue}>Continue</Form.Submit>
        </Form>
    );
}
