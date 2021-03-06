import React, { ReactNode } from 'react';
import Button from '~/cross-app-components/Button';
import DatePicker from '~/components/Form/DatePicker';
import { useTransactionExpiryState } from '~/utils/dataHooks';

import styles from '../common/MultiSignatureFlowPage.module.scss';

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
            <div className="flexChildFill">
                <p className="mT0">
                    Choose the expiry date for the transaction.
                </p>
                <DatePicker
                    className="body2 mV40"
                    label="Transaction expiry time"
                    name="expiry"
                    isInvalid={expiryTimeError !== undefined}
                    error={expiryTimeError}
                    value={expiryTime}
                    onChange={setExpiryTime}
                    minDate={new Date()}
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
