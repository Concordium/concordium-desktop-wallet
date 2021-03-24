import React, { MouseEvent } from 'react';
import clsx from 'clsx';
import { Divider } from 'semantic-ui-react';
import PendingImage from '@resources/svg/pending_old.svg';
import ShieldImage from '@resources/svg/shield.svg';
import { displayAsGTU } from '~/utils/gtu';
import { AccountInfo, Account, AccountStatus } from '~/utils/types';
import { isInitialAccount } from '~/utils/accountHelpers';
// import SidedRow from '~/components/SidedRow';
import styles from './AccountListElement.module.scss';

const nop = () => {};

interface RowProps {
    left: string | JSX.Element;
    right: string | JSX.Element;
    onClick?(e: MouseEvent): void;
}

function SidedRow({ left, right, onClick = nop }: RowProps): JSX.Element {
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className={styles.row} onClick={onClick}>
            <div className={styles.left}>{left}</div>
            <div className={styles.right}>{right}</div>
        </div>
    );
}

interface Props {
    account: Account;
    accountInfo?: AccountInfo | undefined;
    onClick?(shielded: boolean): void;
    active?: boolean;
}

/**
 * Displays the information and balances of the given account.
 * Takes an onClick, which is triggered by when clicking either
 * the shielded balance (with argument true)
 * or the public balances (with argument false)
 */
function AccountListElement({
    account,
    accountInfo,
    onClick = nop,
    active = false,
}: Props): JSX.Element {
    const shielded = account.totalDecrypted
        ? BigInt(account.totalDecrypted)
        : 0n;
    const unShielded = accountInfo ? BigInt(accountInfo.accountAmount) : 0n;
    const scheduled =
        accountInfo && accountInfo.accountReleaseSchedule
            ? BigInt(accountInfo.accountReleaseSchedule.total)
            : 0n;
    const hidden = account.allDecrypted ? null : (
        <>
            {' '}
            + <ShieldImage height="15" />
        </>
    );

    return (
        <div
            className={clsx(styles.accountListElement, active && styles.active)}
            onClick={() => onClick(false)}
            onKeyPress={() => onClick(false)}
            tabIndex={0}
            role="button"
        >
            <SidedRow
                left={
                    <>
                        <h2 className={styles.inline}>
                            {account.name}
                            {account.status === AccountStatus.Pending ? (
                                <PendingImage />
                            ) : undefined}
                        </h2>
                        {isInitialAccount(account) ? <>(Initial)</> : undefined}
                        {accountInfo && accountInfo.accountBaker ? (
                            <>(baker)</>
                        ) : undefined}
                    </>
                }
                right={account.identityName || ''}
            />
            <SidedRow
                left={<h2>Account Total:</h2>}
                right={
                    <>
                        {displayAsGTU(shielded + unShielded)}
                        {hidden}
                    </>
                }
            />
            <Divider />
            <SidedRow
                left={<h3>Balance:</h3>}
                right={displayAsGTU(unShielded)}
            />
            <SidedRow
                left="- At Disposal:"
                right={displayAsGTU(unShielded - scheduled)}
            />
            <Divider />
            <SidedRow
                left="Shielded Balance:"
                right={
                    <>
                        {displayAsGTU(shielded)}
                        {hidden}
                    </>
                }
                onClick={(e) => {
                    e.stopPropagation(); // So that we avoid triggering the parent's onClick
                    onClick(true);
                }}
            />
        </div>
    );
}

AccountListElement.defaultProps = {
    accountInfo: undefined,
    onClick: nop,
};

export default AccountListElement;
