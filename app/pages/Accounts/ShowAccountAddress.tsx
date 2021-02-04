import React from 'react';
import { Header, Button } from 'semantic-ui-react';
import { Account } from '../../utils/types';
import CopyButton from '../../components/CopyButton';

interface Props {
    account: Account;
    returnFunction(): void;
}

/**
 * Displays the account's address, and allows the user to copy it.
 * TODO display QR code of the address?
 */
export default function ShowAccountAddress({ account, returnFunction }: Props) {
    return (
        <>
            <Button onClick={returnFunction}>x</Button>
            <Header textAlign="center">
                Address
                <Header.Subheader textAlign="center">
                    {account.address}
                </Header.Subheader>
            </Header>
            <CopyButton value={account.address} />
        </>
    );
}
