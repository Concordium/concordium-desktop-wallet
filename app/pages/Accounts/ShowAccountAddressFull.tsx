import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QRCode from 'qrcode.react';
import ShrinkIcon from '@resources/svg/shrink.svg';
import { push } from 'connected-react-router';
import { chosenAccountSelector } from '~/features/AccountSlice';
import CopyButton from '~/components/CopyButton';
import PageLayout from '~/components/PageLayout';
import routes from '~/constants/routes.json';
import IconButton from '~/cross-app-components/IconButton';
import AccountPageHeader from './AccountPageHeader';
import DisplayAddress from '~/components/DisplayAddress';

import styles from './Accounts.module.scss';

/**
 * Displays the account's address, and allows the user to copy it.
 */
export default function ShowAccountAddress() {
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector);

    if (!account) {
        return null;
    }

    return (
        <PageLayout>
            <PageLayout.Header>
                <AccountPageHeader />
            </PageLayout.Header>
            <PageLayout.Container
                disableBack
                padding="vertical"
                className={styles.showAddressContainer}
            >
                <IconButton
                    className={styles.shrinkButton}
                    onClick={() => dispatch(push(routes.ACCOUNTS_ADDRESS))}
                >
                    <ShrinkIcon width="25" />
                </IconButton>

                <h2 className="m0 mBauto">{account.name}</h2>
                <QRCode className="mB50" size={512} value={account.address} />
                <div className="flex alignCenter mBauto">
                    <DisplayAddress
                        outerClassName="body2 mL20"
                        lineLength={25}
                        address={account.address}
                    />
                    <CopyButton className="mL20" value={account.address} />
                </div>
            </PageLayout.Container>
        </PageLayout>
    );
}
