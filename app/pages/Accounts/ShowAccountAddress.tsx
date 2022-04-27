import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import ExpandIcon from '@resources/svg/expand.svg';
import Card from '~/cross-app-components/Card';
import routes from '~/constants/routes.json';
import IconButton from '~/cross-app-components/IconButton';
import DisplayAddress, {
    AddressDisplayFormat,
} from '~/components/DisplayAddress';

import { Account, ClassName } from '~/utils/types';
import CopyButton from '~/components/CopyButton';
import VerifyAddress from './VerifyAddress';
import DisplayAsQR from '~/components/DisplayAsQR';

import styles from './Accounts.module.scss';
import CloseButton from '~/cross-app-components/CloseButton';

interface Props extends ClassName {
    account: Account;
    disableClose?: boolean;
}

/**
 * Displays the account's address, and allows the user to copy it.
 */
export default function ShowAccountAddress({
    className,
    account,
    disableClose = false,
}: Props) {
    const dispatch = useDispatch();

    const display = (
        <>
            <DisplayAsQR
                className={styles.displayAddressQRSmall}
                value={account.address}
            />
            <div className={styles.displayAddress}>
                <DisplayAddress
                    className="mH40"
                    lineClassName="body3"
                    address={account.address}
                    format={AddressDisplayFormat.DoubleLine}
                />
                <CopyButton
                    className={styles.displayAddressCopy}
                    value={account.address}
                />
            </div>
        </>
    );

    return (
        <Card
            className={clsx(
                'pH50 pT30',
                styles.showAddressContainer,
                className
            )}
        >
            {disableClose || (
                <CloseButton
                    className={styles.showAddressCloseButton}
                    onClick={() => dispatch(push(routes.ACCOUNTS))}
                />
            )}
            <IconButton
                className={styles.expandButton}
                onClick={() => dispatch(push(routes.SHOWADDRESS))}
            >
                <ExpandIcon height="22" />
            </IconButton>
            <VerifyAddress account={account} display={display} />
        </Card>
    );
}
