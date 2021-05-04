import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { useLocation } from 'react-router-dom';
import { Account, AccountInfo, AccountStatus, Identity } from '~/utils/types';
import AccountListElement from '~/components/AccountListElement';
import { isValidAddress } from '~/utils/accountHelpers';
import { getAccountInfoOfAddress } from '~/utils/nodeHelpers';
import Button from '~/cross-app-components/Button';
import Loading from '~/cross-app-components/Loading';
import RevealAttributes from './RevealAttributes';
import routes from '~/constants/routes.json';
import styles from './GenerateCredential.module.scss';

interface Props {
    setReady: (ready: boolean) => void;
    isReady: boolean;
    address: string;
    setChosenAttributes: (attributes: string[]) => void;
    setAccountValidationError: (error?: string) => void;
    identity: Identity | undefined;
}

const addressLength = 50;
const mustBeDeployedMessage = 'Address must belong to an deployed account';
const invalidAddres = 'Address format is invalid';

/**
 * Displays the currently chosen account's information.
 * Allows the user to reveal attributes.
 */
export default function PickAccount({
    isReady,
    setReady,
    address,
    setChosenAttributes,
    setAccountValidationError,
    identity,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const location = useLocation().pathname;

    if (!identity) {
        throw new Error('unexpected missing identity');
    }

    const [loading, setLoading] = useState<boolean>(false);
    const [accountInfo, setAccountInfo] = useState<AccountInfo | undefined>(
        undefined
    );

    useEffect(() => {
        if (!address || address.length !== addressLength) {
            setAccountValidationError(undefined);
            setAccountInfo(undefined);
            setReady(false);
        } else if (!isValidAddress(address)) {
            setAccountValidationError(invalidAddres);
            setAccountInfo(undefined);
            setReady(false);
        } else {
            setLoading(true);
            getAccountInfoOfAddress(address)
                .then((loadedAccountInfo) => {
                    setLoading(false);
                    setAccountInfo(loadedAccountInfo);
                    setAccountValidationError(
                        loadedAccountInfo ? undefined : mustBeDeployedMessage
                    );
                    return setReady(Boolean(loadedAccountInfo));
                })
                .catch(() => {
                    setLoading(false);
                    setAccountValidationError('Unable to reach node');
                    setReady(false);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address]);

    const fakeAccount: Account = {
        status: AccountStatus.Confirmed,
        identityName: '',
        address,
        name: 'Account',
        identityId: -1,
        maxTransactionId: -1,
        isInitial: false,
    };

    let accountDisplay;
    if (loading) {
        accountDisplay = (
            <div className={styles.accountListElementPlaceholder}>
                <Loading />
            </div>
        );
    } else if (accountInfo) {
        accountDisplay = (
            <AccountListElement
                account={fakeAccount}
                accountInfo={accountInfo}
            />
        );
    } else {
        accountDisplay = (
            <div className={styles.accountListElementPlaceholder}>
                Waiting for Address
            </div>
        );
    }

    return (
        <>
            {accountDisplay}
            {location === routes.GENERATE_CREDENTIAL_REVEALATTRIBUTES ? (
                <RevealAttributes
                    setChosenAttributes={setChosenAttributes}
                    identity={identity}
                />
            ) : (
                <Button
                    disabled={!isReady}
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
