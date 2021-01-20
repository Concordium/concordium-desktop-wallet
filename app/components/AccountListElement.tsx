import React from 'react';
import { Grid, Header, Label, Image } from 'semantic-ui-react';
import { fromMicroUnits } from '../utils/transactionHelpers';
import { AccountInfo, Account, AccountStatus } from '../utils/types';
import SidedText from './SidedText';
import pendingImage from '../../resources/pending.svg';

interface Props {
    account: Account;
    accountInfo: AccountInfo;
    onClick?(shielded: boolean): void;
}

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
    const hidden = account.allDecrypted ? '' : ' + ?'; // Replace with locked Symbol

    return (
        <Grid container columns={2} divided="vertically">
            <Grid.Row>
                <Grid.Column textAlign="left">
                    <Header as="h2">
                        {account.name}
                        {account.confirmed === AccountStatus.Pending ? (
                            <Image
                                src={pendingImage}
                                alt="pending"
                                size="mini"
                                spaced
                            />
                        ) : undefined}
                    </Header>
                    {account.accountNumber === 0 ? (
                        <Label>(Initial)</Label>
                    ) : undefined}
                    {accountInfo && accountInfo.accountBaker ? (
                        <Label>(baker)</Label>
                    ) : undefined}
                </Grid.Column>
                <Grid.Column textAlign="right" content={account.identityName} />
            </Grid.Row>
            <Grid.Row onClick={() => onClick(false)}>
                <Grid container columns={2}>
                    <SidedText
                        left="Account Total:"
                        right={fromMicroUnits(shielded + unShielded) + hidden}
                    />
                    <SidedText
                        left="Balance:"
                        right={fromMicroUnits(unShielded)}
                    />
                    <SidedText
                        left=" - At Disposal:"
                        right={fromMicroUnits(unShielded - scheduled)}
                    />
                    <SidedText left=" - Staked:" right="0" />
                </Grid>
            </Grid.Row>
            <Grid.Row onClick={() => onClick(true)}>
                <Grid.Column textAlign="left">Shielded Balance:</Grid.Column>
                <Grid.Column textAlign="right">
                    {fromMicroUnits(shielded) + hidden}
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}

AccountListElement.defaultProps = {
    onClick: () => {},
};

export default AccountListElement;
