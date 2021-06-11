import React, { useEffect, useState, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Account, AccountInfo } from '~/utils/types';
import AccountCard from '~/components/AccountCard';
import {
    accountsSelector,
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
    setAccount: (account: Account) => void;
    filter?: (account: Account, info?: AccountInfo) => boolean;
    onAccountClicked?(): void;
    isDisabled?: (
        account: Account,
        info?: AccountInfo
    ) => ReactNode | undefined;
}

/**
 * Allows the user to pick an account of the given identity.
 */
export default function PickAccount({
    chosenAccount,
    setAccount,
    filter,
    isDisabled,
    onAccountClicked = noOp,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const accountsInfo = useSelector(accountsInfoSelector);
    const [chosenIndex, setChosenIndex] = useState<number | undefined>();
    const [loaded, setLoaded] = useState(false);

    const filtered = accounts.filter(
        (a) => filter?.(a, accountsInfo[a.address]) ?? true
    );

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
        if (filtered && !loaded) {
            setLoaded(true);
            loadAccountInfos(filtered, dispatch).catch((e) =>
                setError(e.message)
            );
        }
    }, [filtered, dispatch, loaded]);

    return (
        <>
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to load Accounts"
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
                                              onAccountClicked();
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
