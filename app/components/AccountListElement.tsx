import React from 'react';
import styles from './Accounts.css';
import { fromMicroUnits } from '../utils/transactionHelpers';
import { AccountInfo, Account, AccountStatus } from '../utils/types';
import SidedText from './SidedText';

interface Props {
    account: Account;
    accountInfo: AccountInfo;
    onClick?: (shielded: boolean) => void;
    highlighted?: boolean;
    index: number;
}

function AccountListElement({
    account,
    accountInfo,
    onClick,
    highlighted,
    index,
}: Props): JSX.Element {
    function addBadges() {
        return (
            (account.accountNumber === 0 ? '(initial)' : '') +
            (accountInfo && accountInfo.accountBaker ? '(baker)' : '') + // TODO: Replace with bakerImage
            (account.status === AccountStatus.pending ? ' ??? ' : '') // TODO: Replace with pendingImage
        );
    }

    const shielded = account.totalDecrypted
        ? parseInt(account.totalDecrypted, 10)
        : 0;
    const unShielded = accountInfo
        ? parseInt(accountInfo.accountAmount, 10)
        : 0;
    const scheduled =
        accountInfo && accountInfo.accountReleaseSchedule
            ? accountInfo.accountReleaseSchedule.total
            : 0;
    const hidden = account.allDecrypted ? '' : ' + ?'; // Replace with locked Symbol

    return (
        <div
            key={account.address}
            tabIndex={index}
            className={`${styles.accountListElement} ${
                highlighted ? styles.chosenAccountListElement : null
            }`}
        >
            <SidedText
                left={`${account.name}${' '}${addBadges()}`}
                right={account.identityName}
            />
            <SidedText
                left="Account Total:"
                right={fromMicroUnits(shielded + unShielded) + hidden}
            />
            <div
                onClick={() => onClick(false)}
                className={styles.accountListElementUnShieldedBalance}
            >
                <SidedText left="Balance:" right={fromMicroUnits(unShielded)} />
                <SidedText
                    left=" - At Disposal:"
                    right={fromMicroUnits(unShielded - scheduled)}
                />
                <SidedText left=" - Staked:" right="0" />
            </div>
            <div onClick={() => onClick(true)}>
                <SidedText
                    left="Shielded Balance:"
                    right={fromMicroUnits(shielded) + hidden}
                />
            </div>
        </div>
    );
}

AccountListElement.defaultProps = {
    onClick: () => {},
    highlighted: false,
};

export default AccountListElement;
