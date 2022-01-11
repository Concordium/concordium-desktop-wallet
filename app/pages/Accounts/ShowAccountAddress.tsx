import React from 'react';
import { useDispatch } from 'react-redux';
import QRCode from 'qrcode.react';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import ExpandIcon from '@resources/svg/expand.svg';
import Card from '~/cross-app-components/Card';
import routes from '~/constants/routes.json';
import IconButton from '~/cross-app-components/IconButton';
import DisplayAddress, {
    AddressDisplayFormat,
} from '~/components/DisplayAddress';

import { Account, ClassName } from '../../utils/types';
import CopyButton from '../../components/CopyButton';
import VerifyAddress from './VerifyAddress';

import styles from './Accounts.module.scss';

interface Props extends ClassName {
    account: Account;
    asCard?: boolean;
}

/**
 * Displays the account's address, and allows the user to copy it.
 */
export default function ShowAccountAddress({
    className,
    account,
    asCard = false,
}: Props) {
    const dispatch = useDispatch();
    const Component = asCard ? Card : 'div';

    const display = (
        <>
            <QRCode className="m20" value={account.address} size={200} />
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
        <Component
            className={clsx(
                'pH50 pT30',
                styles.showAddressContainer,
                className
            )}
        >
            <IconButton
                className={styles.expandButton}
                onClick={() => dispatch(push(routes.SHOWADDRESS))}
            >
                <ExpandIcon height="22" />
            </IconButton>

            <VerifyAddress account={account} display={display} />
        </Component>
    );
}
