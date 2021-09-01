import React from 'react';
import { useDispatch } from 'react-redux';

import FavouriteIcon from '@resources/svg/star-filled.svg';
import NotFavouriteIcon from '@resources/svg/star-outline.svg';
import clsx from 'clsx';
import Button from '~/cross-app-components/Button';
import { setFavouriteAccount } from '~/features/AccountSlice';
import { Account, ClassName } from '~/utils/types';

interface Props extends ClassName {
    account: Account;
}

export default function AccountFavouriteButton({ account, className }: Props) {
    const dispatch = useDispatch();
    const { isFavourite, address } = account;
    const Icon = isFavourite ? FavouriteIcon : NotFavouriteIcon;

    return (
        <Button
            className={clsx('inlineFlex', className)}
            clear
            disabled={isFavourite}
            onClick={() => setFavouriteAccount(dispatch, address)}
        >
            <Icon width={20} height={20} />
        </Button>
    );
}
