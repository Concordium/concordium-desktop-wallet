import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PendingIcon from '@resources/svg/pending-arrows.svg';
import { RootState } from '~/store/store';

import styles from './TransactionsHeader.module.scss';
import { noOp } from '~/utils/basicHelpers';

interface Props {
    text: string;
}

export default function TransactionsHeader({ text }: Props) {
    const [showSpinner, setShowSpinner] = useState(true);
    const synchronizing = useSelector(
        (s: RootState) => s.transactions.synchronizing
    );

    useEffect(() => {
        if (synchronizing) {
            const t = setTimeout(() => setShowSpinner(true), 500);
            return () => clearTimeout(t);
        }

        setShowSpinner(false);
        return noOp;
    }, [synchronizing]);

    if (!showSpinner) {
        return <>{text}</>;
    }

    return (
        <span className={styles.root}>
            {text} <PendingIcon width="20" className={styles.syncIcon} />
        </span>
    );
}
