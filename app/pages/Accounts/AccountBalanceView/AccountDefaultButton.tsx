import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DefaultIcon from '@resources/svg/star-filled.svg';
import NotDefaultIcon from '@resources/svg/star-outline.svg';
import clsx from 'clsx';
import Button from '~/cross-app-components/Button';
import {
    defaultAccountSelector,
    setDefaultAccount,
} from '~/features/AccountSlice';
import { Account, ClassName } from '~/utils/types';
import ChoiceModal from '~/components/ChoiceModal';

interface Props extends ClassName {
    account: Account;
}

export default function AccountDefaultButton({ account, className }: Props) {
    const dispatch = useDispatch();
    const favAccount = useSelector(defaultAccountSelector);
    const [showPrompt, setShowPrompt] = useState(false);
    const { address, name } = account;
    const isDefault = favAccount?.address === address;
    const Icon = isDefault ? DefaultIcon : NotDefaultIcon;

    const close = () => setShowPrompt(false);

    const description: JSX.Element = useMemo(() => {
        return favAccount ? (
            <>
                <b>{favAccount?.name}</b> is currently set as your default
                account. Do you want to change default account to
                <br />
                <br />
                <b>{name}</b>?
            </>
        ) : (
            <>
                You are about to set a default account. Setting this means, that
                this will be the account initially visible when opening the
                account page.
                <br />
                <br />
                Would you like to set your default account to
                <br />
                <br />
                <b>{name}</b>?
            </>
        );
    }, [favAccount, name]);

    return (
        <>
            <ChoiceModal
                open={showPrompt}
                title={
                    favAccount
                        ? 'Set new default account?'
                        : 'Set default account?'
                }
                description={description}
                actions={[
                    { label: 'Cancel' },
                    {
                        label: 'Set default',
                        action: () => setDefaultAccount(dispatch, address),
                    },
                ]}
                postAction={close}
                onClose={close}
            />
            <Button
                className={clsx('inlineFlex', className)}
                clear
                disabled={isDefault}
                onClick={() => setShowPrompt(true)}
            >
                <Icon width={20} height={20} />
            </Button>
        </>
    );
}
