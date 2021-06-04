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
import { Account, AccountInfo } from '~/utils/types';

interface ActionObject {
    route: string;
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Image: any;
    imageClassName: string;
    height: number;
    width?: number;
    isDisabled(hasCredential: boolean, isMultiSig: boolean): boolean;
}

const more: ActionObject = {
    route: routes.ACCOUNTS_MORE,
    label: 'More',
    Image: MoreImage,
    imageClassName: 'mB15',
    height: 30,
    width: 30,
    isDisabled: () => false,
};
const viewingShieldedbuttons: ActionObject[] = [
    {
        route: routes.ACCOUNTS_ENCRYPTEDTRANSFER,
        label: 'Send',
        Image: SendEncryptedImage,
        imageClassName: styles.actionImage,
        height: 35,
        isDisabled: (hasCredential: boolean) => !hasCredential,
    },
    {
        route: routes.ACCOUNTS_UNSHIELDAMOUNT,
        label: 'Unshield',
        Image: UnshieldImage,
        imageClassName: styles.actionImage,
        height: 40,
        isDisabled: (hasCredential: boolean) => !hasCredential,
    },
    more,
];
const viewingUnshieldedbuttons: ActionObject[] = [
    {
        route: routes.ACCOUNTS_SIMPLETRANSFER,
        label: 'Send',
        Image: SendImage,
        imageClassName: styles.actionImage,
        height: 30,
        isDisabled: (hasCredential: boolean) => !hasCredential,
    },
    {
        route: routes.ACCOUNTS_SHIELDAMOUNT,
        label: 'Shield',
        Image: ShieldImage,
        imageClassName: styles.actionImage,
        height: 30,
        isDisabled: (hasCredential: boolean, isMultiSig: boolean) =>
            !hasCredential || isMultiSig,
    },
    more,
];

function AccountViewAction({
    route,
    label,
    Image,
    imageClassName,
    height,
    width,
    isDisabled,
    hasCredentials,
    isMultiSig,
}: ActionObject & {
    isMultiSig: boolean;
    hasCredentials: boolean;
}): JSX.Element {
    const disabled = isDisabled(hasCredentials, isMultiSig);

    return (
        <ButtonNavLink
            key={route}
            className={clsx(
                styles.actionButton,
                disabled && styles.disabledActionButton
            )}
            disabled={disabled}
            to={route}
        >
            <Image height={height} width={width} className={imageClassName} />
            {label}
        </ButtonNavLink>
    );
}

interface Props {
    account: Account;
    accountInfo: AccountInfo;
}

export default function AccountViewActions({ account, accountInfo }: Props) {
    const viewingShielded = useSelector(viewingShieldedSelector);
    const accountHasDeployedCredentials = useSelector(
        accountHasDeployedCredentialsSelector(account)
    );
    const isMultiSig = Object.values(accountInfo.accountCredentials).length > 1;

    let buttons = [];
    if (viewingShielded) {
        buttons = viewingShieldedbuttons;
    } else {
        buttons = viewingUnshieldedbuttons;
    }

    return (
        <div className={styles.actionButtonsCard}>
            {buttons.map((props) => (
                <AccountViewAction
                    key={props.route}
                    {...props}
                    isMultiSig={isMultiSig}
                    hasCredentials={accountHasDeployedCredentials}
                />
            ))}
        </div>
    );
}
