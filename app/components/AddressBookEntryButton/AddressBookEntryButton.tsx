import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import AddressBookEntryIcon from '@resources/svg/identity.svg';
import Button from '~/cross-app-components/Button';
import styles from '~/pages/AddressBook/AddressBookList/AddressBookList.module.scss';
import itemStyles from './AddressBookEntryButton.module.scss';

interface Props {
    onClick: () => void;
    error?: boolean;
}

export default function AddressBookEntryButton({
    children,
    onClick,
    error,
}: PropsWithChildren<Props>) {
    return (
        <Button
            className={clsx(itemStyles.item, error && itemStyles.error)}
            icon={<AddressBookEntryIcon className={styles.identityIcon} />}
            tabIndex={0}
            inverted
            size="huge"
            onKeyPress={onClick}
            onClick={onClick}
        >
            {children}
        </Button>
    );
}
