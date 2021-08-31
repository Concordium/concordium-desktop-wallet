import React from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import SendImage from '@resources/svg/paperplane.svg';
import BracketsImage from '@resources/svg/brackets.svg';
import UnshieldImage from '@resources/svg/unshield.svg';
import ShieldImage from '@resources/svg/shield.svg';
import SendEncryptedImage from '@resources/svg/shielded-paperplane.svg';
import { Dispatch } from 'redux';
import routes from '~/constants/routes.json';
import { viewingShieldedSelector } from '~/features/TransactionSlice';
import { accountHasDeployedCredentialsSelector } from '~/features/CredentialSlice';
import ButtonNavLink from '~/components/ButtonNavLink';
import styles from './AccountViewAction.module.scss';
import { Account, AccountInfo } from '~/utils/types';
import Button from '~/cross-app-components/Button';

interface ActionObject {
    action: string | ((dispatch: Dispatch) => void);
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Image: any;
    imageClassName: string;
    height: number;
    width?: number;
    isDisabled(hasCredential: boolean, isMultiSig: boolean): boolean;
}

const more: ActionObject = {
    action: () => null,
    label: 'Change view',
    Image: BracketsImage,
    imageClassName: 'mB15',
    height: 30,
    width: 48,
    isDisabled: () => false,
};
const shieldedActions: ActionObject[] = [
    {
        action: routes.ACCOUNTS_ENCRYPTEDTRANSFER,
        label: 'Send',
        Image: SendEncryptedImage,
        imageClassName: styles.actionImage,
        height: 35,
        isDisabled: (hasCredential: boolean) => !hasCredential,
    },
    {
        action: routes.ACCOUNTS_UNSHIELDAMOUNT,
        label: 'Unshield',
        Image: UnshieldImage,
        imageClassName: styles.actionImage,
        height: 40,
        isDisabled: (hasCredential: boolean) => !hasCredential,
    },
    more,
];
const unshieldedActions: ActionObject[] = [
    {
        action: routes.ACCOUNTS_SIMPLETRANSFER,
        label: 'Send',
        Image: SendImage,
        imageClassName: styles.actionImage,
        height: 30,
        isDisabled: (hasCredential: boolean) => !hasCredential,
    },
    {
        action: routes.ACCOUNTS_SHIELDAMOUNT,
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
    action,
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

    const body = (
        <>
            <Image height={height} width={width} className={imageClassName} />
            {label}
        </>
    );
    if (typeof action === 'string') {
        return (
            <ButtonNavLink
                className={clsx(
                    styles.actionButton,
                    disabled && styles.disabledActionButton
                )}
                disabled={disabled}
                to={action}
            >
                {body}
            </ButtonNavLink>
        );
    }

    return (
        <Button
            className={clsx(
                styles.actionButton,
                disabled && styles.disabledActionButton
            )}
            size="huge"
            inverted
            disabled={disabled}
        >
            {body}
        </Button>
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

    const actions = viewingShielded ? shieldedActions : unshieldedActions;

    return (
        <div className={styles.actionButtonsCard}>
            {actions.map((props, i) => (
                <AccountViewAction
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    {...props}
                    isMultiSig={isMultiSig}
                    hasCredentials={accountHasDeployedCredentials}
                />
            ))}
        </div>
    );
}
