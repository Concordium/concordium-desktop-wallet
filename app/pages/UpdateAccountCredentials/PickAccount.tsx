import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Menu } from 'semantic-ui-react';
import { Identity, Account } from '../../utils/types';
import AccountListElement from '../../components/AccountListElement';
import { accountsOfIdentitySelector } from '../../features/AccountSlice';

interface Props {
    identity: Identity | undefined;
    setReady: (ready: boolean) => void;
    setAccount: (account: Account) => void;
}

/**
 * Allows the user to pick an account of the given identity.
 */
export default function PickAccount({
    setReady,
    setAccount,
    identity,
}: Props): JSX.Element {
    if (!identity) {
        throw new Error('unexpected missing identity');
    }

    const accounts = useSelector(accountsOfIdentitySelector(identity));
    const [chosenIndex, setChosenIndex] = useState(-1);

    return (
        <Menu vertical fluid>
            {accounts.map((account: Account, i: number) => (
                <Menu.Item
                    key={account.address}
                    onClick={() => {
                        setReady(true);
                        setChosenIndex(i);
                        setAccount(account);
                    }}
                    active={chosenIndex === i}
                >
                    <AccountListElement account={account} />
                </Menu.Item>
            ))}
        </Menu>
    );
}
