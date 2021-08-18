import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '~/features/AccountSlice';
import {
    TransactionKindId,
    AddressBookEntry,
    Fraction,
    EqualRecord,
} from '~/utils/types';
import { getGTUSymbol } from '~/utils/gtu';
import AddressBookEntryButton from '~/components/AddressBookEntryButton';
import Button from '~/cross-app-components/Button';
import Form from '~/components/Form';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import {
    validateTransferAmount,
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
    toPickRecipient?(currentAmount: string, memo?: string): void;
    toConfirmTransfer(amount: string, memo?: string): void;
    transactionKind: TransactionKindId;
    defaultMemo?: string;
    setMemo?: (currentMemo?: string) => void;
}

interface PickAmountForm {
    amount: string;
    recipient: string;
    memo: string;
}

const fieldNames: EqualRecord<PickAmountForm> = {
    amount: 'amount',
    recipient: 'recipient',
    memo: 'memo',
};

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
    defaultMemo,
    setMemo,
}: Props) {
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const form = useForm<PickAmountForm>({ mode: 'onTouched' });
    const { errors, watch } = form;

    const currentMemo = watch(fieldNames.memo);
    useEffect(() => {
        if (setMemo) {
            setMemo(currentMemo);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMemo]);

    const handleSubmit: SubmitHandler<PickAmountForm> = useCallback(
        (values) => {
            const { amount, memo } = values;
            toConfirmTransfer(amount, memo);
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
        return validateTransferAmount(
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
                        name={fieldNames.amount}
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
                {setMemo ? (
                    <Form.TextArea
                        name={fieldNames.memo}
                        className={styles.memoField}
                        label={<span className="h3">Memo</span>}
                        defaultValue={defaultMemo}
                        placeholder="You can add a memo here"
                    />
                ) : null}
                {toPickRecipient ? (
                    <>
                        <div style={{ display: 'none' }}>
                            <Form.Checkbox
                                name={fieldNames.recipient}
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
                                toPickRecipient(
                                    form.getValues(fieldNames.amount),
                                    form.getValues(fieldNames.memo)
                                );
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
