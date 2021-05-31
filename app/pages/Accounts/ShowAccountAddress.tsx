import React from 'react';
import QRCode from 'qrcode.react';
import { Account } from '../../utils/types';
import CopyButton from '../../components/CopyButton';
import CloseButton from '~/cross-app-components/CloseButton';
import Card from '~/cross-app-components/Card';
import styles from './Accounts.module.scss';

interface Props {
    account: Account;
    returnFunction(): void;
}

/**
 * Displays the account's address, and allows the user to copy it.
 */
export default function ShowAccountAddress({ account, returnFunction }: Props) {
    return (
        <Card className="flexColumn alignCenter relative pH50">
            <CloseButton
                className={styles.closeButton}
                onClick={returnFunction}
            />
            <h3 className="m0">Address</h3>
            <QRCode className="m20" value={account.address} />
            <div className="flex">
                <p className="body4 mL20">{account.address}</p>
                <CopyButton className="mL20" value={account.address} />
            </div>
        </Card>
    );
}
