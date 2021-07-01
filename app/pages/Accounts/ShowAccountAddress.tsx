import React from 'react';
import { useDispatch } from 'react-redux';
import QRCode from 'qrcode.react';
import { push } from 'connected-react-router';
import ExpandIcon from '@resources/svg/expand.svg';
import { Account } from '../../utils/types';
import CopyButton from '../../components/CopyButton';
import CloseButton from '~/cross-app-components/CloseButton';
import Card from '~/cross-app-components/Card';
import styles from './Accounts.module.scss';
import routes from '~/constants/routes.json';
import IconButton from '~/cross-app-components/IconButton';

interface Props {
    account: Account;
    returnFunction(): void;
}

/**
 * Displays the account's address, and allows the user to copy it.
 */
export default function ShowAccountAddress({ account, returnFunction }: Props) {
    const dispatch = useDispatch();

    return (
        <Card className="flexColumn alignCenter relative pH50">
            <IconButton
                className={styles.expandButton}
                onClick={() => dispatch(push(routes.SHOWADDRESS))}
            >
                <ExpandIcon height="22" />
            </IconButton>
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
