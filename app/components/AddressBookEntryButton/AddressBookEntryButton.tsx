import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import AddressBookEntryIcon from '@resources/svg/identity.svg';
import Button from '~/cross-app-components/Button';
import iconStyle from '~/pages/AddressBook/AddressBookList/AddressBookList.module.scss';
import itemStyle from './AddressBookEntryButton.module.scss';

interface Props {
    onClick: () => void;
    error?: boolean;
    className?: string;
}

export default function AddressBookEntryButton({
    children,
    onClick,
    error,
    className,
}: PropsWithChildren<Props>) {
    return (
        <Button
            className={clsx(
                itemStyle.button,
                error && itemStyle.error,
                className
            )}
            icon={<AddressBookEntryIcon className={iconStyle.identityIcon} />}
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
