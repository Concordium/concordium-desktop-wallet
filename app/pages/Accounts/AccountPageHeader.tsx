import React from 'react';
import { useSelector } from 'react-redux';
import ShieldImage from '@resources/svg/shield.svg';
import {
    confirmedAccountsSelector,
    accountsInfoSelector,
} from '~/features/AccountSlice';
import { Account, AccountInfo } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import { sumToBigInt } from '~/utils/basicHelpers';
import { getPublicAccountAmounts } from '~/utils/accountHelpers';

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
        <>
            <h1>Accounts</h1>
            <h1 className="mH40">|</h1>
            <h3 className="mR20">
                Wallet Total:{' '}
                <b>
                    {displayAsGTU(totalAmount)}
                    {hidden}{' '}
                </b>
                |
            </h3>
            <h3 className="mR20">
                At disposal:{' '}
                <b>
                    {displayAsGTU(totalAtDisposal)}
                    {hidden}{' '}
                </b>
                |
            </h3>
            <h3 className="mR20">
                Stake: <b>{displayAsGTU(totalStaked)}</b>
            </h3>
        </>
    );
}
