import React from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import SendImage from '@resources/svg/paperplane.svg';
import QrImage from '@resources/svg/qr.svg';
import UnshieldImage from '@resources/svg/unshield.svg';
import ShieldImage from '@resources/svg/shield.svg';
import SendEncryptedImage from '@resources/svg/shielded-paperplane.svg';
import routes from '~/constants/routes.json';
import { viewingShieldedSelector } from '~/features/TransactionSlice';
import { accountHasDeployedCredentialsSelector } from '~/features/CredentialSlice';
import ButtonNavLink from '~/components/ButtonNavLink';
import { Account, AccountInfo } from '~/utils/types';

import styles from './AccountViewAction.module.scss';

interface ActionObject {
    action: string;
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Image: any;
    imageClassName?: string;
    height: number;
    width?: number;
    isDisabled(
        hasCredential: boolean,
        isMultiSig: boolean,
        hasInfo: boolean
    ): boolean;
}

const receiveAction: ActionObject = {
    action: routes.ACCOUNTS_ADDRESS,
    label: 'Receive',
    Image: QrImage,
    height: 22,
    isDisabled: () => false,
};
const shieldedActions: ActionObject[] = [
    {
        action: routes.ACCOUNTS_ENCRYPTEDTRANSFER,
        label: 'Send',
        Image: SendEncryptedImage,
        imageClassName: styles.shieldActionImage,
        height: 25,
        isDisabled: (hasCredential: boolean, _, hasInfo) =>
            !hasCredential || !hasInfo,
    },
    {
        action: routes.ACCOUNTS_UNSHIELDAMOUNT,
        label: 'Unshield',
        Image: UnshieldImage,
        height: 25,
        isDisabled: (hasCredential: boolean, _, hasInfo) =>
            !hasCredential || !hasInfo,
    },
    receiveAction,
];
const unshieldedActions: ActionObject[] = [
    {
        action: routes.ACCOUNTS_SIMPLETRANSFER,
        label: 'Send',
        Image: SendImage,
        height: 25,
        isDisabled: (hasCredential: boolean, _, hasInfo) =>
            !hasCredential || !hasInfo,
    },
    {
        action: routes.ACCOUNTS_SHIELDAMOUNT,
        label: 'Shield',
        Image: ShieldImage,
        imageClassName: styles.shieldActionImage,
        height: 25,
        isDisabled: (hasCredential: boolean, isMultiSig, hasInfo) =>
            !hasCredential || !hasInfo || isMultiSig,
    },
    receiveAction,
];

function AccountViewAction({
    action,
    label,
    Image,
    imageClassName,
    height,
    width,
    isDisabled,
    hasCredentials,
    isMultiSig,
    hasInfo,
}: ActionObject & {
    isMultiSig: boolean;
    hasCredentials: boolean;
    hasInfo: boolean;
}): JSX.Element {
    const disabled = isDisabled(hasCredentials, isMultiSig, hasInfo);

    return (
        <ButtonNavLink
            to={action}
            className={clsx(
                styles.actionButton,
                disabled && styles.disabledActionButton
            )}
            disabled={disabled}
            inverted={false}
        >
            <Image
                height={height}
                width={width}
                className={clsx(styles.actionImage, 'mB5', imageClassName)}
            />
            {label}
        </ButtonNavLink>
    );
}

interface Props {
    account: Account;
    accountInfo?: AccountInfo;
}

export default function AccountViewActions({ account, accountInfo }: Props) {
    const viewingShielded = useSelector(viewingShieldedSelector);
    const accountHasDeployedCredentials = useSelector(
        accountHasDeployedCredentialsSelector(account)
    );
    const isMultiSig =
        Object.values(accountInfo?.accountCredentials ?? {}).length > 1;

    const actions = viewingShielded ? shieldedActions : unshieldedActions;

    return (
        <div className={styles.actionButtons}>
            {actions.map((props, i) => (
                <AccountViewAction
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    {...props}
                    isMultiSig={isMultiSig}
                    hasCredentials={accountHasDeployedCredentials}
                    hasInfo={Boolean(accountInfo)}
                />
            ))}
        </div>
    );
}
