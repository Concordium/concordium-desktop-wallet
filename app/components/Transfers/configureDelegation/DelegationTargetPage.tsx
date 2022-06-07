import React from 'react';
import { useForm, Validate } from 'react-hook-form';
import { OpenStatusText } from '@concordium/node-sdk/lib/src/types';
import { isDelegatorAccount } from '@concordium/node-sdk/lib/src/accountHelpers';
import Form from '~/components/Form';
import ExternalLink from '~/components/ExternalLink';
import { validBigInt } from '~/components/Form/util/validation';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { getPoolStatusLatest } from '~/node/nodeHelpers';
import {
    ConfigureDelegationFlowState,
    getExistingDelegationValues,
} from '~/utils/transactionFlows/configureDelegation';
import { AccountInfo, EqualRecord, NotOptional } from '~/utils/types';
import urls from '~/constants/urls.json';

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
    const defaultValue = initial !== undefined ? initial : existing;
    const defaultValues: FormState = {
        toSpecificPool: typeof defaultValue === 'string',
        poolId: defaultValue ?? '',
    };

    const form = useForm<FormState>({ mode: 'onTouched', defaultValues });
    const toSpecificPoolValue = form.watch(fieldNames.toSpecificPool);

    const validateBakerId: Validate = async (value?: string) => {
        if (value === undefined || value === existing) {
            return true;
        }

        try {
            const bakerId = BigInt(value);
            // Throws if response is undefined.
            const poolStatus = await getPoolStatusLatest(bakerId);

            if (poolStatus.poolInfo.openStatus !== OpenStatusText.OpenForAll) {
                return 'Targeted baker does not allow new delegators';
            }

            if (
                isDelegatorAccount(accountInfo) &&
                poolStatus.delegatedCapitalCap - poolStatus.delegatedCapital <
                    accountInfo.accountDelegation.stakedAmount
            ) {
                return "Your current stake would violate the targeted baker's cap";
            }

            return true;
        } catch {
            return "Supplied baker ID doesn't match an active baker.";
        }
    };

    const handleSubmit = ({ toSpecificPool, poolId }: FormState) =>
        onNext(toSpecificPool && poolId !== undefined ? poolId : null);

    return (
        <Form<FormState>
            className={styles.root}
            onSubmit={handleSubmit}
            formMethods={form}
        >
            <div className="flexChildFill">
                <p className="mB30 mT0">
                    Please choose to delegate to a specific baker pool or
                    passive delegation.
                </p>
                <div className="mT50">
                    {existing !== undefined && (
                        <div className="body3 mono mB10">
                            Current target: {existing ?? 'passive delegation'}
                        </div>
                    )}
                    <Form.Radios
                        name={fieldNames.toSpecificPool}
                        options={[
                            { label: 'Delegate to pool', value: true },
                            { label: 'Passive delegation ', value: false },
                        ]}
                    />
                </div>
                {toSpecificPoolValue ? (
                    <>
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
                                    validateBakerId,
                                },
                            }}
                        />
                        <p className="mB30">
                            If you don&apos;t already know what baker pool you
                            want to delegate an amount to, you can read more
                            about finding one here:
                        </p>
                    </>
                ) : (
                    <p className="mB20">
                        Passive delegation is an alternative to delegation to a
                        specific baker pool that has lower rewards. With passive
                        delegation you do not have to worry about the uptime or
                        quality of a baker node. For more info you can visit:
                    </p>
                )}
                <p className="mV0">
                    <ExternalLink href={urls.delegationDocumention}>
                        developer.concordium.software
                    </ExternalLink>
                </p>
            </div>
            <Form.Submit className={styles.continue}>Continue</Form.Submit>
        </Form>
    );
}
