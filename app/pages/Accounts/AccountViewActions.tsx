import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import { Button } from 'semantic-ui-react';
import { viewingShieldedSelector } from '../../features/TransactionSlice';
import routes from '../../constants/routes.json';
import styles from './Accounts.module.scss';
import SendImage from '../../../resources/svg/paperplane.svg';
import MoreImage from '../../../resources/svg/more.svg';
import ShieldImage from '../../../resources/svg/shield.svg';
import SendEncryptedImage from '../../../resources/svg/shielded-paperplane.svg';

const more = {
    route: routes.ACCOUNTS_MORE,
    label: 'More',
    Image: MoreImage,
    height: '10',
};
const viewingShieldedbuttons = [
    {
        route: routes.ACCOUNTS_ENCRYPTEDTRANSFER,
        label: 'Send',
        Image: SendEncryptedImage,
        height: '35',
    },
    {
        route: routes.ACCOUNTS_UNSHIELDAMOUNT,
        label: 'Shield',
        Image: ShieldImage, // TODO: Replace with unshield image
        height: '30',
    },
    more,
];
const viewingUnshieldedbuttons = [
    {
        route: routes.ACCOUNTS_SIMPLETRANSFER,
        label: 'Send',
        Image: SendImage,
        height: '30',
    },
    {
        route: routes.ACCOUNTS_SHIELDAMOUNT,
        label: 'Shield',
        Image: ShieldImage,
        height: '30',
    },
    more,
];

export default function AccountViewActions() {
    const viewingShielded = useSelector(viewingShieldedSelector);
    const location = useLocation();
    const dispatch = useDispatch();

    let buttons = [];
    if (viewingShielded) {
        buttons = viewingShieldedbuttons;
    } else {
        buttons = viewingUnshieldedbuttons;
    }
    console.log(buttons);

    return (
        <Button.Group>
            {buttons.map(({ route, label, Image, height }) => (
                <Button
                    key={route + label}
                    onClick={() => dispatch(push(route))}
                    className={styles.accountActionButton}
                    disabled={location.pathname.startsWith(route)}
                >
                    <Image height={height} className={styles.actionImage} />
                    {label}
                </Button>
            ))}
        </Button.Group>
    );
}
