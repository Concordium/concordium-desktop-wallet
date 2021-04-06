import clsx from 'clsx';
import React from 'react';
import AddressBookEntryIcon from '@resources/svg/identity.svg';
import Button from '~/cross-app-components/Button';
import styles from './AddressBookEntryButton.module.scss';

interface Props {
    onClick: () => void;
    error?: boolean;
    className?: string;
    title: string;
    comment?: string;
}

/**
 * A button with a AddressBookEntryIcon.
 * Can display an errornous state.
 */
export default function AddressBookEntryButton({
    onClick,
    error,
    className,
    title,
    comment,
}: Props) {
    return (
        <Button
            className={clsx(styles.root, error && styles.error, className)}
            icon={<AddressBookEntryIcon className={styles.icon} />}
            tabIndex={0}
            inverted
            size="big"
            onKeyPress={onClick}
            onClick={onClick}
        >
            <div className={styles.title}>{title}</div>
            {comment && <div className={styles.comment}>{comment}</div>}
        </Button>
    );
}
