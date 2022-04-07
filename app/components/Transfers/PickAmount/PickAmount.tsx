import React, { useCallback, useEffect, useState } from 'react';
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
import { getCcdSymbol } from '~/utils/ccd';
import AddressBookEntryButton from '~/components/AddressBookEntryButton';
import Button from '~/cross-app-components/Button';
import Form from '~/components/Form';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import {
    validateTransferAmount,
    validateShieldedAmount,
    validateMemo,
} from '~/utils/transactionHelpers';
import { collapseFraction } from '~/utils/basicHelpers';
import transferStyles from '../Transfers.module.scss';
import styles from './PickAmount.module.scss';
import ErrorMessage from '~/components/Form/ErrorMessage';
import MemoWarning from '~/components/MemoWarning';

interface MemoProps {
    defaultMemo?: string;
    setMemo: (currentMemo?: string) => void;
    shownMemoWarning: boolean;
    setShownMemoWarning: (shown: boolean) => void;
}

interface Props {
    recipient?: AddressBookEntry | undefined;
    defaultAmount: string;
    header: string;
    estimatedFee?: Fraction | undefined;
    toPickRecipient?(currentAmount: string, memo?: string): void;
    toConfirmTransfer(amount: string, memo?: string): void;
    transactionKind: TransactionKindId;
    // Presence determines whether to show memo input.
    memo?: MemoProps;
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
    memo,
}: Props) {
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const [memoFocused, setMemoFocused] = useState<boolean>(false);
    const form = useForm<PickAmountForm>({ mode: 'onTouched' });
    const { errors, watch } = form;

    const currentMemo = watch(fieldNames.memo);
    useEffect(() => {
        if (memo) {
            memo.setMemo(currentMemo);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMemo]);

    const handleSubmit: SubmitHandler<PickAmountForm> = useCallback(
        (values) => toConfirmTransfer(values.amount, values.memo),
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
                    {getCcdSymbol()}
                    <Form.CcdInput
                        name={fieldNames.amount}
                        defaultValue={defaultAmount}
                        rules={{
                            required: 'Amount required',
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
                {memo ? (
                    <>
                        <Form.TextArea
                            name={fieldNames.memo}
                            className={styles.memoField}
                            label={<span className="h3">Memo</span>}
                            onFocus={() => setMemoFocused(true)}
                            rules={{ validate: validateMemo }}
                            defaultValue={memo.defaultMemo}
                            placeholder="You can add a memo here"
                        />
                        <MemoWarning
                            open={memoFocused && !memo.shownMemoWarning}
                            onClose={() => memo.setShownMemoWarning(true)}
                        />
                    </>
                ) : null}
                {toPickRecipient ? (
                    <>
                        <div style={{ display: 'none' }}>
                            <Form.Checkbox
                                name={fieldNames.recipient}
                                rules={{
                                    required: 'Recipient required',
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
                                recipient ? recipient.name : 'Select recipient'
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
