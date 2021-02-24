import React from 'react';
import { Header, Button } from 'semantic-ui-react';
import QRCode from 'qrcode.react';
import { Account } from '../../utils/types';
import CopyButton from '../../components/CopyButton';

interface Props {
    account: Account;
    returnFunction(): void;
}

/**
 * Displays the account's address, and allows the user to copy it.
 */
export default function ShowAccountAddress({ account, returnFunction }: Props) {
    return (
        <>
            <Button onClick={returnFunction}>x</Button>
            <Header textAlign="center">
                Address
                <Header.Subheader>
                    <QRCode value={account.address} />
                </Header.Subheader>
                <Header.Subheader textAlign="center">
                    {account.address}
                </Header.Subheader>
            </Header>
            <CopyButton value={account.address} />
        </>
    );
}
