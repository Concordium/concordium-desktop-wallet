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

function getUnshieldedAmount(accountsInfo: AccountInfo[]) {
    return sumToBigInt(accountsInfo, (accountInfo) =>
        BigInt(accountInfo.accountAmount)
    );
}

function getTotalLocked(accountsInfo: AccountInfo[]) {
    return sumToBigInt(accountsInfo, (accountInfo) =>
        BigInt(accountInfo.accountReleaseSchedule.total)
    );
}

function getTotalStaked(accountsInfo: AccountInfo[]) {
    return sumToBigInt(accountsInfo, (accountInfo) =>
        accountInfo.accountBaker
            ? BigInt(accountInfo.accountBaker.stakedAmount)
            : 0n
    );
}

function getShieldedAmount(accounts: Account[]) {
    return sumToBigInt(accounts, (account) =>
        account.totalDecrypted ? BigInt(account.totalDecrypted) : 0n
    );
}

function isAllDecrypted(accounts: Account[]) {
    return accounts.every((account) => account.allDecrypted);
}

export default function AccountPageHeader() {
    const accounts = useSelector(confirmedAccountsSelector);
    const accountInfoMap = useSelector(accountsInfoSelector);
    const accountsInfo = Object.values(accountInfoMap);

    const totalShielded = getShieldedAmount(accounts);
    const totalAmount = getUnshieldedAmount(accountsInfo) + totalShielded;
    const totalLocked = getTotalLocked(accountsInfo);
    const totalStaked = getTotalStaked(accountsInfo);
    const atDisposal = totalAmount - totalLocked - totalStaked;
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
                    {displayAsGTU(atDisposal)}
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
