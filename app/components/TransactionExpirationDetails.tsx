import clsx from 'clsx';
import React from 'react';
import { getFormattedDateString, getNow } from '~/utils/timeHelpers';
import { TimeStampUnit } from '~/utils/types';

interface TransactionExpirationDetailsProps {
    title: string;
    expirationDate?: Date;
}

export default function TransactionExpirationDetails({
    title,
    expirationDate,
}: TransactionExpirationDetailsProps): JSX.Element | null {
    if (!expirationDate) {
        return null;
    }

    const hasExpired =
        expirationDate.valueOf() < getNow(TimeStampUnit.milliSeconds);
    return (
        <>
            <h5>{title}</h5>
            <span className={clsx('h3', hasExpired && 'textError')}>
                {getFormattedDateString(expirationDate)}
            </span>
        </>
    );
}
