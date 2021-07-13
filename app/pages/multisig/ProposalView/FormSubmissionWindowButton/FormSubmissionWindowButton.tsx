import React from 'react';
import Form from '~/components/Form';
import { useCurrentTime } from '~/utils/hooks';
import { dateFromTimeStamp, subtractHours } from '~/utils/timeHelpers';
import { getTimeout } from '~/utils/transactionHelpers';
import { Transaction } from '~/utils/types';

interface FormSubmissionWindowButtonProps {
    transaction: Transaction;
}

/**
 * A form submission button that is disabled while the transaction is
 * outside of the valid submission window, where the transaction would
 * be discarded if submitted to the node.
 */
export default function FormSubmissionWindowButton({
    transaction,
}: FormSubmissionWindowButtonProps) {
    const now = useCurrentTime(15000);
    const expiry = dateFromTimeStamp(getTimeout(transaction));
    const submissionWindowStart = subtractHours(2, expiry);
    const isBeforeSubmissionWindow = now < submissionWindowStart;
    return (
        <Form.Submit disabled={isBeforeSubmissionWindow}>
            Submit transaction to chain
        </Form.Submit>
    );
}
