import React from 'react';
import { Grid, Header, Label, Image, Divider } from 'semantic-ui-react';
import { fromMicroUnits } from '../utils/gtu';
import { AccountInfo, Account, AccountStatus } from '../utils/types';
import SidedText from './SidedText';
import pendingImage from '../../resources/pending.svg';

function isInitialAccount(account: Account) {
    return account.accountNumber === 0;
}

interface Props {
    account: Account;
    accountInfo: AccountInfo;
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
    onClick,
}: Props): JSX.Element {
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
    const hidden = account.allDecrypted ? '' : ' + ?'; // TODO: Replace with locked Symbol

    return (
        <Grid container columns={2} onClick={() => onClick(false)}>
            <Grid.Row>
                <Grid.Column textAlign="left">
                    <Header as="h2">
                        {account.name}
                        {account.status === AccountStatus.Pending ? (
                            <Image
                                src={pendingImage}
                                alt="pending"
                                size="mini"
                                spaced
                            />
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

            <SidedText
                left="Account Total:"
                right={fromMicroUnits(shielded + unShielded) + hidden}
            />
            <Divider />
            <SidedText left="Balance:" right={fromMicroUnits(unShielded)} />
            <SidedText
                left=" - At Disposal:"
                right={fromMicroUnits(unShielded - scheduled)}
            />
            <Divider />
            <SidedText
                left="Shielded Balance:"
                right={fromMicroUnits(shielded) + hidden}
                onClick={(e) => {
                    e.stopPropagation(); // So that we avoid triggering the parent's onClick
                    onClick(true);
                }}
            />
        </Grid>
    );
}

AccountListElement.defaultProps = {
    onClick: () => {},
};

export default AccountListElement;
