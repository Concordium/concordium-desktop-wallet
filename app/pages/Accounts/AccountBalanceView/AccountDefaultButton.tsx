import React, { useCallback, useState } from 'react';
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

    const setDefault = useCallback(() => {
        if (favAccount) {
            setShowPrompt(true);
        } else {
            setDefaultAccount(dispatch, address);
        }
    }, [favAccount, dispatch, address]);

    const close = () => setShowPrompt(false);

    return (
        <>
            <ChoiceModal
                open={showPrompt}
                title="Set new default account?"
                description={
                    <>
                        <b>{favAccount?.name}</b> is currently set as your
                        default account. Do you want to change default account
                        to
                        <br />
                        <br />
                        <b>{name}</b>?
                    </>
                }
                actions={[
                    { label: 'Cancel' },
                    {
                        label: 'Change default',
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
                onClick={setDefault}
            >
                <Icon width={20} height={20} />
            </Button>
        </>
    );
}
