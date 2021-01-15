import React from 'react';
import styles from './Accounts.css';
import { fromMicroUnits } from '../utils/transactionHelpers';
import { AccountInfo, Account, AccountStatus } from '../utils/types';
import SidedText from './SidedText';
import pendingImage from '../../resources/pending.svg';

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
        // TODO: Replace (baker) with bakerImage
        return (
            <>
                {account.accountNumber === 0 ? '(initial)' : ''}
                {accountInfo && accountInfo.accountBaker ? '(baker)' : ''}
                {account.status === AccountStatus.pending ? (
                    <img
                        className={styles.pendingImage}
                        src={pendingImage}
                        alt="pending"
                    />
                ) : (
                    ''
                )}
            </>
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
            <div className={styles.line}>
                <div className={styles.leftAlignedText}>
                    {account.name} {addBadges()}
                </div>
                <p className={styles.rightAlignedText}>
                    {account.identityName}
                </p>
            </div>
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
