import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Identity, Account, AccountInfo } from '~/utils/types';
import AccountCard from '~/components/AccountCard';
import {
    accountsOfIdentitySelector,
    accountsSelector,
    accountsInfoSelector,
    loadAccountInfos,
} from '~/features/AccountSlice';
import CardList from '~/cross-app-components/CardList';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import routes from '~/constants/routes.json';
import ErrorMessage from './Form/ErrorMessage';

interface Props {
    chosenAccount?: Account;
    identity?: Identity;
    setAccount: (account: Account) => void;
    filter?: (account: Account, info?: AccountInfo) => boolean;
    isDisabled?: (account: Account, info?: AccountInfo) => string | undefined;
}

/**
 * Allows the user to pick an account of the given identity.
 */
export default function PickAccount({
    chosenAccount,
    setAccount,
    identity,
    filter,
    isDisabled,
}: Props): JSX.Element {
    const dispatch = useDispatch();

    const selectAccounts = useMemo(
        () =>
            identity ? accountsOfIdentitySelector(identity) : accountsSelector,
        [identity]
    );
    const accounts = useSelector(selectAccounts);
    const accountsInfo = useSelector(accountsInfoSelector);
    const [chosenIndex, setChosenIndex] = useState<number | undefined>();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (chosenAccount) {
            setChosenIndex(
                accounts.findIndex(
                    (acc) => acc.address === chosenAccount.address
                )
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        if (accounts && !loaded) {
            setLoaded(true);
            loadAccountInfos(accounts, dispatch).catch((e) =>
                setError(e.message)
            );
        }
    }, [accounts, dispatch, loaded]);

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to load Accounts"
                content={error}
                onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
            />
            <CardList>
                {accounts
                    .filter((a) => filter?.(a, accountsInfo[a.address]) ?? true)
                    .map((account: Account, index: number) => {
                        const disabledReason = isDisabled?.(
                            account,
                            accountsInfo[account.address]
                        );
                        return (
                            <div key={account.address}>
                                <AccountCard
                                    active={index === chosenIndex}
                                    disabled={disabledReason !== undefined}
                                    account={account}
                                    accountInfo={accountsInfo[account.address]}
                                    onClick={
                                        disabledReason === undefined
                                            ? () => {
                                                  setChosenIndex(index);
                                                  setAccount(account);
                                              }
                                            : undefined
                                    }
                                />
                                {disabledReason && (
                                    <ErrorMessage>
                                        {disabledReason}
                                    </ErrorMessage>
                                )}
                            </div>
                        );
                    })}
            </CardList>
        </>
    );
}
