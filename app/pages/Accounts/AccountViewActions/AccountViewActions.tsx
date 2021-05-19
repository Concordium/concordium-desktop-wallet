import React from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import SendImage from '@resources/svg/paperplane.svg';
import MoreImage from '@resources/svg/more.svg';
import UnshieldImage from '@resources/svg/unshield.svg';
import ShieldImage from '@resources/svg/shield.svg';
import SendEncryptedImage from '@resources/svg/shielded-paperplane.svg';
import routes from '~/constants/routes.json';
import { viewingShieldedSelector } from '~/features/TransactionSlice';
import { accountHasDeployedCredentialsSelector } from '~/features/CredentialSlice';
import ButtonNavLink from '~/components/ButtonNavLink';
import styles from './AccountViewAction.module.scss';
import { Account } from '~/utils/types';

const more = {
    route: routes.ACCOUNTS_MORE,
    label: 'More',
    Image: MoreImage,
    imageClassName: 'mB15',
    height: '10',
    isDisabled: () => false,
};
const viewingShieldedbuttons = [
    {
        route: routes.ACCOUNTS_ENCRYPTEDTRANSFER,
        label: 'Send',
        Image: SendEncryptedImage,
        imageClassName: styles.actionImage,
        height: '35',
        isDisabled: (hasCredential: boolean) => !hasCredential,
    },
    {
        route: routes.ACCOUNTS_UNSHIELDAMOUNT,
        label: 'Unshield',
        Image: UnshieldImage,
        imageClassName: styles.actionImage,
        height: '40',
        isDisabled: (hasCredential: boolean) => !hasCredential,
    },
    more,
];
const viewingUnshieldedbuttons = [
    {
        route: routes.ACCOUNTS_SIMPLETRANSFER,
        label: 'Send',
        Image: SendImage,
        imageClassName: styles.actionImage,
        height: '30',
        isDisabled: (hasCredential: boolean) => !hasCredential,
    },
    {
        route: routes.ACCOUNTS_SHIELDAMOUNT,
        label: 'Shield',
        Image: ShieldImage,
        imageClassName: styles.actionImage,
        height: '30',
        isDisabled: (hasCredential: boolean) => !hasCredential,
    },
    more,
];

interface Props {
    account: Account;
}

export default function AccountViewActions({ account }: Props) {
    const viewingShielded = useSelector(viewingShieldedSelector);
    const accountHasDeployedCredentials = useSelector(
        accountHasDeployedCredentialsSelector(account)
    );

    let buttons = [];
    if (viewingShielded) {
        buttons = viewingShieldedbuttons;
    } else {
        buttons = viewingUnshieldedbuttons;
    }

    return (
        <div className={styles.actionButtonsCard}>
            {buttons.map(
                ({
                    route,
                    label,
                    Image,
                    imageClassName,
                    height,
                    isDisabled,
                }) => (
                    <ButtonNavLink
                        key={route}
                        className={clsx(
                            styles.actionButton,
                            isDisabled(accountHasDeployedCredentials) &&
                                styles.disabledActionButton
                        )}
                        disabled={isDisabled(accountHasDeployedCredentials)}
                        to={route}
                    >
                        <Image height={height} className={imageClassName} />
                        {label}
                    </ButtonNavLink>
                )
            )}
        </div>
    );
}
