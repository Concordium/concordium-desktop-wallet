import React, { useEffect, useState, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Account, AccountInfo } from '~/utils/types';
import AccountCard from '~/components/AccountCard';
import {
    confirmedAccountsSelector,
    accountsInfoSelector,
    loadAccountInfos,
} from '~/features/AccountSlice';
import CardList from '~/cross-app-components/CardList';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import routes from '~/constants/routes.json';
import ErrorMessage from './Form/ErrorMessage';
import { noOp } from '~/utils/basicHelpers';

interface Props {
    chosenAccount?: Account;
    setAccount?: (account: Account) => void;
    filter?: (account: Account, info?: AccountInfo) => boolean;
    onAccountClicked?(account: Account): void;
    isDisabled?: (
        account: Account,
        info?: AccountInfo
    ) => ReactNode | undefined;
    messageWhenEmpty: string;
}

/**
 * Allows the user to pick an account of the given identity.
 */
export default function PickAccount({
    chosenAccount,
    setAccount = noOp,
    filter = () => true,
    isDisabled,
    onAccountClicked = noOp,
    messageWhenEmpty,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const accounts = useSelector(confirmedAccountsSelector);
    const accountsInfo = useSelector(accountsInfoSelector);
    const [chosenIndex, setChosenIndex] = useState<number | undefined>();
    const [loaded, setLoaded] = useState(false);

    const filtered = accounts.filter((a) => filter(a, accountsInfo[a.address]));

    useEffect(() => {
        if (chosenAccount) {
            setChosenIndex(
                filtered.findIndex(
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

    if (filtered.length === 0) {
        return <h2>{messageWhenEmpty}</h2>;
    }

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to load accounts"
                content={error}
                onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
            />
            <CardList>
                {filtered.map((account: Account, index: number) => {
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
                                              onAccountClicked(account);
                                          }
                                        : undefined
                                }
                            />
                            {disabledReason && (
                                <ErrorMessage>{disabledReason}</ErrorMessage>
                            )}
                        </div>
                    );
                })}
            </CardList>
        </>
    );
}
