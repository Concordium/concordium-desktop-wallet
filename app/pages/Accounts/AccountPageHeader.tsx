import React from 'react';
import { useSelector } from 'react-redux';
import ShieldImage from '@resources/svg/shield.svg';
import { displayAsCcd } from 'wallet-common-helpers/lib/utils/ccd';
import {
    confirmedAccountsSelector,
    accountsInfoSelector,
} from '~/features/AccountSlice';
import { Account, AccountInfo } from '~/utils/types';
import { sumToBigInt } from '~/utils/basicHelpers';
import { getPublicAccountAmounts } from '~/utils/accountHelpers';

import styles from './Accounts.module.scss';

function getShieldedAmount(accounts: Account[]) {
    return sumToBigInt(accounts, (account) =>
        account.totalDecrypted ? BigInt(account.totalDecrypted) : 0n
    );
}

function isAllDecrypted(accounts: Account[]) {
    return accounts.every((account) => account.allDecrypted);
}

function getTotalPublicAmounts(accountsInfo: AccountInfo[]) {
    const amounts = accountsInfo.map(getPublicAccountAmounts);
    const totalUnshielded = sumToBigInt(amounts, (amount) => amount.total);
    const atDisposal = sumToBigInt(amounts, (amount) => amount.atDisposal);
    const totalStaked = sumToBigInt(amounts, (amount) => amount.staked);
    return { totalUnshielded, atDisposal, totalStaked };
}

export default function AccountPageHeader() {
    const accounts = useSelector(confirmedAccountsSelector);
    const accountInfoMap = useSelector(accountsInfoSelector);
    const accountsInfo = Object.values(accountInfoMap);

    const totalShielded = getShieldedAmount(accounts);

    const { totalUnshielded, atDisposal, totalStaked } = getTotalPublicAmounts(
        accountsInfo
    );
    const totalAmount = totalUnshielded + totalShielded;
    const totalAtDisposal = atDisposal + totalShielded;

    const allDecrypted = isAllDecrypted(accounts);

    const hidden = allDecrypted ? null : (
        <>
            {' '}
            + <ShieldImage height="15" />
        </>
    );

    return (
        <span className={styles.pageHeader}>
            <h1 className="pR40 mR40">Accounts</h1>
            <h3 className="pR20 mR20">
                Wallet total:{' '}
                <b>
                    {displayAsCcd(totalAmount)}
                    {hidden}{' '}
                </b>
            </h3>
            <h3 className="pR20 mR20">
                At disposal:{' '}
                <b>
                    {displayAsCcd(totalAtDisposal)}
                    {hidden}{' '}
                </b>
            </h3>
            <h3>
                Stake: <b>{displayAsCcd(totalStaked)}</b>
            </h3>
        </span>
    );
}
