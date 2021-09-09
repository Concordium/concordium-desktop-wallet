import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import FavouriteIcon from '@resources/svg/star-filled.svg';
import NotFavouriteIcon from '@resources/svg/star-outline.svg';
import clsx from 'clsx';
import Button from '~/cross-app-components/Button';
import {
    favouriteAccountSelector,
    setFavouriteAccount,
} from '~/features/AccountSlice';
import { Account, ClassName } from '~/utils/types';
import ChoiceModal from '~/components/ChoiceModal';

interface Props extends ClassName {
    account: Account;
}

export default function AccountFavouriteButton({ account, className }: Props) {
    const dispatch = useDispatch();
    const favAccount = useSelector(favouriteAccountSelector);
    const [showPrompt, setShowPrompt] = useState(false);
    const { address, name } = account;
    const isFavourite = favAccount?.address === address;
    const Icon = isFavourite ? FavouriteIcon : NotFavouriteIcon;

    const setFavourite = useCallback(() => {
        if (favAccount) {
            setShowPrompt(true);
        } else {
            setFavouriteAccount(dispatch, address);
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
                        action: () => setFavouriteAccount(dispatch, address),
                    },
                ]}
                postAction={close}
                onClose={close}
            />
            <Button
                className={clsx('inlineFlex', className)}
                clear
                disabled={isFavourite}
                onClick={setFavourite}
            >
                <Icon width={20} height={20} />
            </Button>
        </>
    );
}
