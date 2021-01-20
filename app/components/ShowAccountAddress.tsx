import React from 'react';
import { Header, Button } from 'semantic-ui-react';
import { Account } from '../utils/types';
import CopyButton from './CopyButton';

interface Props {
    account: Account;
    returnFunction(): void;
}

// TODO display QR?

export default function ShowAccountAddress({ account, returnFunction }: Props) {
    return (
        <>
            <Button onClick={returnFunction}>x</Button>
            <Header textAlign="center"> Address </Header>
            <Header sub>{account.address}</Header>
            <CopyButton value={account.address} />
        </>
    );
}
