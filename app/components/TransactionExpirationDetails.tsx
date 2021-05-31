import clsx from 'clsx';
import React from 'react';
import { useCurrentTime } from '~/utils/hooks';
import { getFormattedDateString } from '~/utils/timeHelpers';

interface TransactionExpirationDetailsProps {
    title: string;
    expirationDate?: Date;
}

export default function TransactionExpirationDetails({
    title,
    expirationDate,
}: TransactionExpirationDetailsProps): JSX.Element | null {
    const now = useCurrentTime();
    if (!expirationDate) {
        return null;
    }

    const hasExpired = expirationDate < now;
    return (
        <>
            <h5>{title}</h5>
            <span className={clsx('h3', hasExpired && 'textError')}>
                {getFormattedDateString(expirationDate)}
            </span>
        </>
    );
}
