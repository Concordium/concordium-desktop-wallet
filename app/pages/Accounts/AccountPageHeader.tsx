import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import PlusIcon from '@resources/svg/plus.svg';
import {
    accountsSelector,
    accountsInfoSelector,
} from '~/features/AccountSlice';
import routes from '~/constants/routes.json';
import { Account, AccountInfo } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import { sumToBigInt } from '~/utils/basicHelpers';
import PageLayout from '~/components/PageLayout';

function getTotalAmount(accountsInfo: AccountInfo[]) {
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

function isAllDecrypted(accounts: Account[]) {
    return accounts.every((account) => account.allDecrypted);
}

export default function AccountPageHeader() {
    const dispatch = useDispatch();

    const accounts = useSelector(accountsSelector);
    const accountInfoMap = useSelector(accountsInfoSelector);
    const accountsInfo = Object.values(accountInfoMap);

    const totalAmount = getTotalAmount(accountsInfo);
    const totalLocked = getTotalLocked(accountsInfo);
    const totalStaked = getTotalStaked(accountsInfo);
    const atDisposal = totalAmount - totalLocked - totalStaked;
    const allDecrypted = isAllDecrypted(accounts);

    return (
        <>
            <h1>Accounts | </h1>
            <h2>
                Wallet Total: {displayAsGTU(totalAmount)}
                {allDecrypted ? '' : ' + ?'} | At disposal:{' '}
                {displayAsGTU(atDisposal)} {allDecrypted ? '' : ' + ?'} | stake:{' '}
                {displayAsGTU(totalStaked)}
            </h2>
            <PageLayout.HeaderButton
                align="right"
                onClick={() => dispatch(push(routes.ACCOUNTCREATION))}
            >
                <PlusIcon height="20" />
            </PageLayout.HeaderButton>
        </>
    );
}
