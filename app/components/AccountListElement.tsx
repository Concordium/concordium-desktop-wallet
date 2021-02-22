import React from 'react';
import { Grid, Header, Label, Divider } from 'semantic-ui-react';
import { displayAsGTU } from '../utils/gtu';
import { AccountInfo, Account, AccountStatus } from '../utils/types';
import { isInitialAccount } from '../utils/accountHelpers';
import SidedRow from './SidedRow';
import PendingImage from '../../resources/svg/pending_old.svg';

const nop = () => {};

interface Props {
    account: Account;
    accountInfo?: AccountInfo | undefined;
    onClick?(shielded: boolean): void;
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
}: Props): JSX.Element {
    const shielded = account.totalDecrypted
        ? BigInt(account.totalDecrypted)
        : 0n;
    const unShielded = accountInfo ? BigInt(accountInfo.accountAmount) : 0n;
    const scheduled =
        accountInfo && accountInfo.accountReleaseSchedule
            ? BigInt(accountInfo.accountReleaseSchedule.total)
            : 0n;
    const hidden = account.allDecrypted ? '' : ' + ?'; // TODO: Replace with locked Symbol

    return (
        <Grid container columns={2} onClick={() => onClick(false)}>
            <Grid.Row>
                <Grid.Column textAlign="left">
                    <Header as="h2">
                        {account.name}
                        {account.status === AccountStatus.Pending ? (
                            <PendingImage />
                        ) : undefined}
                    </Header>
                    {isInitialAccount(account) ? (
                        <Label>(Initial)</Label>
                    ) : undefined}
                    {accountInfo && accountInfo.accountBaker ? (
                        <Label>(baker)</Label>
                    ) : undefined}
                </Grid.Column>
                <Grid.Column textAlign="right" content={account.identityName} />
            </Grid.Row>

            <SidedRow
                left="Account Total:"
                right={displayAsGTU(shielded + unShielded) + hidden}
            />
            <Divider />
            <SidedRow left="Balance:" right={displayAsGTU(unShielded)} />
            <SidedRow
                left=" - At Disposal:"
                right={displayAsGTU(unShielded - scheduled)}
            />
            <Divider />
            <SidedRow
                left="Shielded Balance:"
                right={displayAsGTU(shielded) + hidden}
                onClick={(e) => {
                    e.stopPropagation(); // So that we avoid triggering the parent's onClick
                    onClick(true);
                }}
            />
        </Grid>
    );
}

AccountListElement.defaultProps = {
    accountInfo: undefined,
    onClick: nop,
};

export default AccountListElement;
