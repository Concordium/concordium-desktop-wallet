import React, { ReactNode } from 'react';
import InputTimestamp from '~/components/Form/InputTimestamp';
import Button from '~/cross-app-components/Button';
import { useTransactionExpiryState } from '~/utils/dataHooks';
import styles from './MultisignatureAccountTransactions.module.scss';

interface Props {
    buttonText: string;
    onClick: (expiry: Date) => void;
    children?: ReactNode;
}

export default function ChooseExpiry({ onClick, buttonText, children }: Props) {
    const [
        expiryTime,
        setExpiryTime,
        expiryTimeError,
    ] = useTransactionExpiryState();

    return (
        <div className={styles.columnContent}>
            <div className={styles.flex1}>
                <p className="mT0">
                    Choose the expiry date for the transaction.
                </p>
                <InputTimestamp
                    label="Transaction expiry time"
                    name="expiry"
                    isInvalid={expiryTimeError !== undefined}
                    error={expiryTimeError}
                    value={expiryTime}
                    onChange={setExpiryTime}
                />
                <p className="mB0">
                    Committing the transaction after this date, will result in
                    rejection.
                </p>
                {children || null}
            </div>
            <Button
                className="mT40"
                disabled={
                    expiryTime === undefined || expiryTimeError !== undefined
                }
                onClick={() => expiryTime && onClick(expiryTime)}
            >
                {buttonText}
            </Button>
        </div>
    );
}
