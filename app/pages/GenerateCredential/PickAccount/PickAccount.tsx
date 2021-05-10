import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Redirect, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Controller, useFormContext } from 'react-hook-form';
import { Account, AccountInfo, AccountStatus } from '~/utils/types';
import AccountCard from '~/components/AccountCard';
import { getAccountInfoOfAddress } from '~/utils/nodeHelpers';
import Button from '~/cross-app-components/Button';
import routes from '~/constants/routes.json';
import ConnectionStatusComponent, {
    Status,
} from '~/components/ConnectionStatusComponent';
import SelectIdentityAttributes from '~/components/SelectIdentityAttributes';
import CardList from '~/cross-app-components/CardList';

import generalStyles from '../GenerateCredential.module.scss';
import styles from './PickAccount.module.scss';
import { AccountForm, fieldNames } from '../types';

const mustBeDeployedMessage = 'Address must belong to a deployed account';

/**
 * Displays the currently chosen account's information.
 * Allows the user to reveal attributes.
 */
export default function PickAccount(): JSX.Element {
    const dispatch = useDispatch();
    const location = useLocation().pathname;
    const {
        getValues,
        register,
        errors,
        setValue,
        trigger,
        clearErrors,
        control,
        formState,
        watch,
    } = useFormContext<AccountForm>();
    const { identity } = getValues();
    const { address, accountName, accountInfo } = watch();
    const shouldRedirect = !identity;

    const [status, setStatus] = useState<Status>(Status.Pending);

    function setAccountInfo(info: AccountInfo | undefined): void {
        setValue(fieldNames.accountInfo, info, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    useEffect(() => {
        if (!shouldRedirect) {
            register(fieldNames.accountInfo, {
                required: true,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!errors.address && address) {
            setStatus(Status.Loading);
            getAccountInfoOfAddress(address)
                .then((loadedAccountInfo) => {
                    // eslint-disable-next-line promise/always-return
                    if (!loadedAccountInfo) {
                        throw new Error();
                    }

                    setStatus(Status.Successful);
                    setAccountInfo(loadedAccountInfo);
                })
                .catch(() => {
                    setStatus(Status.Failed);
                    trigger(fieldNames.accountInfo);
                });
        } else {
            setAccountInfo(undefined);
            setStatus(Status.Pending);
            clearErrors(fieldNames.accountInfo);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address]);

    if (shouldRedirect) {
        return <Redirect to={routes.GENERATE_CREDENTIAL_PICKIDENTITY} />;
    }

    const fakeAccount: Account = {
        status: AccountStatus.Confirmed,
        identityName: identity.name,
        address,
        name: accountName || 'Name pending',
        identityId: -1,
        maxTransactionId: -1,
        isInitial: false,
    };

    let accountDisplay;
    if (accountInfo) {
        accountDisplay = (
            <AccountCard
                className={generalStyles.card}
                account={fakeAccount}
                accountInfo={accountInfo}
            />
        );
    } else if (address) {
        accountDisplay = (
            <div
                className={clsx(
                    generalStyles.card,
                    styles.accountListElementPlaceholder
                )}
            >
                <ConnectionStatusComponent
                    failedMessage={
                        errors.accountInfo ? mustBeDeployedMessage : undefined
                    }
                    status={status}
                />
            </div>
        );
    }

    const isRevealAttributesRoute =
        location === routes.GENERATE_CREDENTIAL_REVEALATTRIBUTES;

    return (
        <>
            <CardList className={styles.accountWrapper}>
                {accountDisplay}
                {isRevealAttributesRoute && (
                    <Controller
                        name={fieldNames.chosenAttributes}
                        control={control}
                        render={({ onBlur, onChange, value }) => (
                            <SelectIdentityAttributes
                                className={generalStyles.card}
                                identity={identity}
                                chosenAttributes={value}
                                setChosenAttributes={(a) => {
                                    onChange(a);
                                    onBlur();
                                }}
                            />
                        )}
                    />
                )}
            </CardList>
            {!isRevealAttributesRoute && accountInfo && (
                <Button
                    className={styles.button}
                    inverted
                    disabled={!formState.isValid}
                    onClick={() =>
                        dispatch(
                            push(routes.GENERATE_CREDENTIAL_REVEALATTRIBUTES)
                        )
                    }
                >
                    Reveal Attributes
                </Button>
            )}
        </>
    );
}
