import React, { useState, useEffect, useContext } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Controller, useController, useFormContext } from 'react-hook-form';
import { Account, AccountInfo, AccountStatus } from '~/utils/types';
import AccountCard from '~/components/AccountCard';
import { getAccountInfoOfAddress } from '~/node/nodeHelpers';
import Button from '~/cross-app-components/Button';
import routes from '~/constants/routes.json';
import ConnectionStatusComponent, {
    Status,
} from '~/components/ConnectionStatusComponent';
import SelectIdentityAttributes from '~/components/SelectIdentityAttributes';
import CardList from '~/cross-app-components/CardList';
import { AccountForm, fieldNames } from '../types';
import savedStateContext from '../savedStateContext';

import generalStyles from '../GenerateCredential.module.scss';
import styles from './PickAccount.module.scss';

const mustBeDeployedMessage = 'Address must belong to a deployed account';

interface Props {
    onNext(path: string): void;
}

/**
 * Displays the currently chosen account's information.
 * Allows the user to reveal attributes.
 */
export default function PickAccount({ onNext }: Props): JSX.Element {
    const location = useLocation().pathname;
    const {
        identity,
        accountName: savedAccountName,
        accountInfo: savedAccountInfo,
        chosenAttributes = [],
    } = useContext(savedStateContext);
    const {
        errors,
        setError,
        clearErrors,
        formState,
        watch,
        control,
    } = useFormContext<AccountForm>();

    const {
        address,
        accountName = savedAccountName,
        accountInfo = savedAccountInfo,
    } = watch();
    const {
        field: { onChange: onAccountChange, onBlur: onAccountBlur },
    } = useController({
        name: fieldNames.accountInfo,
        control,
        defaultValue: savedAccountInfo ?? null,
    });

    const [status, setStatus] = useState<Status>(Status.Pending);
    const isRevealAttributesRoute =
        location === routes.GENERATE_CREDENTIAL_REVEALATTRIBUTES;

    function setAccountInfo(info: AccountInfo | undefined): void {
        onAccountChange(info);
        onAccountBlur();
    }

    useEffect(() => {
        if (isRevealAttributesRoute) {
            return;
        }

        if (!errors.address && address) {
            setStatus(Status.Loading);
            getAccountInfoOfAddress(address)
                .then((loadedAccountInfo) => {
                    // eslint-disable-next-line promise/always-return
                    if (!loadedAccountInfo) {
                        setStatus(Status.Failed);
                        setError(fieldNames.accountInfo, {
                            type: 'manual',
                            message: mustBeDeployedMessage,
                        });
                    } else {
                        setStatus(Status.Successful);
                        setAccountInfo(loadedAccountInfo);
                    }
                })
                .catch(() => {
                    setStatus(Status.Failed);
                    clearErrors(fieldNames.accountInfo);
                });
        } else {
            setAccountInfo(undefined);
            setStatus(Status.Pending);
            clearErrors(fieldNames.accountInfo);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address]);

    if (!identity) {
        return <Redirect to={routes.GENERATE_CREDENTIAL_PICKIDENTITY} />;
    }

    const fakeAccount: Account = {
        status: AccountStatus.Confirmed,
        identityName: identity?.name,
        address,
        name: accountName || 'Name pending',
        identityId: -1,
        maxTransactionId: '',
        isInitial: false,
        rewardFilter: {},
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
    } else if (address && !errors.address) {
        accountDisplay = (
            <div
                className={clsx(
                    generalStyles.card,
                    styles.accountListElementPlaceholder,
                    'textCenter'
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

    return (
        <>
            <CardList className={styles.accountWrapper}>
                {accountDisplay}
                {isRevealAttributesRoute && (
                    <Controller
                        defaultValue={chosenAttributes}
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
                    className={clsx(
                        'bgOffWhite',
                        generalStyles.continueButton,
                        styles.button
                    )}
                    inverted
                    disabled={!formState.isValid}
                    onClick={() =>
                        onNext(routes.GENERATE_CREDENTIAL_REVEALATTRIBUTES)
                    }
                >
                    Reveal Attributes
                </Button>
            )}
        </>
    );
}
