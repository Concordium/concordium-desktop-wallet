import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '~/features/AccountSlice';
import { TransactionKindId, AddressBookEntry, Fraction } from '~/utils/types';
import { getGTUSymbol } from '~/utils/gtu';
import AddressBookEntryButton from '~/components/AddressBookEntryButton';
import Button from '~/cross-app-components/Button';
import Form from '~/components/Form';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import {
    validateAmount,
    validateShieldedAmount,
} from '~/utils/transactionHelpers';
import { collapseFraction } from '~/utils/basicHelpers';
import transferStyles from '../Transfers.module.scss';
import styles from './PickAmount.module.scss';
import ErrorMessage from '~/components/Form/ErrorMessage';

interface Props {
    recipient?: AddressBookEntry | undefined;
    defaultAmount: string;
    header: string;
    estimatedFee?: Fraction | undefined;
    toPickRecipient?(currentAmount: string): void;
    toConfirmTransfer(amount: string): void;
    transactionKind: TransactionKindId;
}

interface PickAmountForm {
    amount: string;
    recipient: string;
}

/**
 * Allows the user to enter an amount, and redirects to picking a recipient.
 */
export default function PickAmount({
    recipient,
    header,
    estimatedFee,
    defaultAmount,
    toPickRecipient,
    toConfirmTransfer,
    transactionKind,
}: Props) {
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const form = useForm<PickAmountForm>({ mode: 'onTouched' });
    const { errors } = form;

    const handleSubmit: SubmitHandler<PickAmountForm> = useCallback(
        (values) => {
            const { amount } = values;
            toConfirmTransfer(amount);
        },
        [toConfirmTransfer]
    );

    function validate(amount: string) {
        if (
            [
                TransactionKindId.Transfer_to_public,
                TransactionKindId.Encrypted_transfer,
            ].includes(transactionKind)
        ) {
            return validateShieldedAmount(
                amount,
                account,
                accountInfo,
                estimatedFee && collapseFraction(estimatedFee)
            );
        }
        return validateAmount(
            amount,
            accountInfo,
            estimatedFee && collapseFraction(estimatedFee)
        );
    }

    return (
        <>
            <h3 className={transferStyles.header}>{header}</h3>
            <Form formMethods={form} onSubmit={handleSubmit}>
                <div className={styles.amountInputWrapper}>
                    {getGTUSymbol()}
                    <Form.GtuInput
                        name="amount"
                        defaultValue={defaultAmount}
                        rules={{
                            required: 'Amount Required',
                            validate,
                        }}
                    />
                </div>
                <span className="textCenter">
                    <ErrorMessage>{errors.amount?.message}</ErrorMessage>
                </span>
                <DisplayEstimatedFee
                    className={styles.estimatedFee}
                    estimatedFee={estimatedFee}
                />
                {toPickRecipient ? (
                    <>
                        <div style={{ display: 'none' }}>
                            <Form.Checkbox
                                name="recipient"
                                rules={{
                                    required: 'Recipient Required',
                                }}
                                checked={Boolean(recipient?.address)}
                                readOnly
                            />
                        </div>
                        <AddressBookEntryButton
                            className={styles.pickRecipient}
                            error={Boolean(form.errors?.recipient)}
                            onClick={() => {
                                toPickRecipient(form.getValues('amount'));
                            }}
                            title={
                                recipient ? recipient.name : 'Select Recipient'
                            }
                            comment={recipient?.note}
                        />
                        <p className={transferStyles.errorLabel}>
                            {form.errors?.recipient?.message}
                        </p>
                    </>
                ) : null}
                <Form.Submit as={Button} size="big">
                    Continue
                </Form.Submit>
            </Form>
        </>
    );
}
