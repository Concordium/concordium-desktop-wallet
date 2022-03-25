import React from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import SendImage from '@resources/svg/paperplane.svg';
import BracketsImage from '@resources/svg/brackets.svg';
import UnshieldImage from '@resources/svg/unshield.svg';
import ShieldImage from '@resources/svg/shield.svg';
import SendEncryptedImage from '@resources/svg/shielded-paperplane.svg';
import { Dispatch } from 'redux';
import { push } from 'connected-react-router';
import routes from '~/constants/routes.json';
import { viewingShieldedSelector } from '~/features/TransactionSlice';
import { accountHasDeployedCredentialsSelector } from '~/features/CredentialSlice';
import ButtonNavLink from '~/components/ButtonNavLink';
import { Account, AccountInfo } from '~/utils/types';
import Button from '~/cross-app-components/Button';
import { toggleAccountView } from '~/features/AccountSlice';

import styles from './AccountViewAction.module.scss';

interface ActionObject {
    action: string | ((dispatch: Dispatch) => void);
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Image: any;
    imageClassName: string;
    height: number;
    width?: number;
    isDisabled(
        hasCredential: boolean,
        isMultiSig: boolean,
        hasInfo: boolean
    ): boolean;
}

const changeView: ActionObject = {
    action: (dispatch) => {
        toggleAccountView(dispatch);
        dispatch(push(routes.ACCOUNTS));
    },
    label: 'Change view',
    Image: BracketsImage,
    imageClassName: clsx(styles.actionImage, 'mB15'),
    height: 30,
    width: 48,
    isDisabled: () => false,
};
const shieldedActions: ActionObject[] = [
    {
        action: routes.ACCOUNTS_ENCRYPTEDTRANSFER,
        label: 'Send',
        Image: SendEncryptedImage,
        imageClassName: clsx(styles.actionImage, 'mB5'),
        height: 35,
        isDisabled: (hasCredential: boolean, _, hasInfo) =>
            !hasCredential || !hasInfo,
    },
    {
        action: routes.ACCOUNTS_UNSHIELDAMOUNT,
        label: 'Unshield',
        Image: UnshieldImage,
        imageClassName: clsx(styles.actionImage, 'mB5'),
        height: 40,
        isDisabled: (hasCredential: boolean, _, hasInfo) =>
            !hasCredential || !hasInfo,
    },
    changeView,
];
const unshieldedActions: ActionObject[] = [
    {
        action: routes.ACCOUNTS_SIMPLETRANSFER,
        label: 'Send',
        Image: SendImage,
        imageClassName: clsx(styles.actionImage, 'mB5'),
        height: 30,
        isDisabled: (hasCredential: boolean, _, hasInfo) =>
            !hasCredential || !hasInfo,
    },
    {
        action: routes.ACCOUNTS_SHIELDAMOUNT,
        label: 'Shield',
        Image: ShieldImage,
        imageClassName: clsx(styles.actionImage, 'mB5'),
        height: 30,
        isDisabled: (hasCredential: boolean, isMultiSig, hasInfo) =>
            !hasCredential || !hasInfo || isMultiSig,
    },
    changeView,
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
    const dispatch = useDispatch();

    const sharedProps = {
        className: clsx(
            styles.actionButton,
            disabled && styles.disabledActionButton
        ),
        disabled,
    };

    const body = (
        <>
            <Image height={height} width={width} className={imageClassName} />
            {label}
        </>
    );

    if (typeof action === 'string') {
        return (
            <ButtonNavLink to={action} {...sharedProps}>
                {body}
            </ButtonNavLink>
        );
    }

    return (
        <Button
            size="huge"
            inverted
            onClick={() => action(dispatch)}
            {...sharedProps}
        >
            {body}
        </Button>
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
        <div className={styles.actionButtonsCard}>
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
