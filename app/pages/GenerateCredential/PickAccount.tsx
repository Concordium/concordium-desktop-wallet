import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { useLocation } from 'react-router-dom';
import { Account, AccountInfo, AccountStatus, Identity } from '~/utils/types';
import AccountCard from '~/components/AccountCard';
import { isValidAddress } from '~/utils/accountHelpers';
import { getAccountInfoOfAddress } from '~/utils/nodeHelpers';
import Button from '~/cross-app-components/Button';
import RevealAttributes from './RevealAttributes';
import routes from '~/constants/routes.json';
import styles from './GenerateCredential.module.scss';
import ConnectionStatusComponent, {
    Status,
} from '~/components/ConnectionStatusComponent';

interface Props {
    setReady: (ready: boolean) => void;
    isReady: boolean;
    address: string;
    setChosenAttributes: (attributes: string[]) => void;
    setAccountValidationError: (error?: string) => void;
    accountValidationError?: string;
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
    accountValidationError,
    identity,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const location = useLocation().pathname;

    if (!identity) {
        throw new Error('unexpected missing identity');
    }

    const [status, setStatus] = useState<Status>(Status.Pending);
    const [accountInfo, setAccountInfo] = useState<AccountInfo | undefined>(
        undefined
    );

    useEffect(() => {
        let validAddress = true;
        if (!address || address.length !== addressLength) {
            validAddress = false;
            setAccountValidationError(undefined);
        } else if (!isValidAddress(address)) {
            validAddress = false;
            setAccountValidationError(invalidAddres);
        }

        if (validAddress) {
            setStatus(Status.Loading);
            getAccountInfoOfAddress(address)
                .then((loadedAccountInfo) => {
                    setStatus(
                        loadedAccountInfo ? Status.Successful : Status.Failed
                    );
                    setAccountInfo(loadedAccountInfo);
                    setAccountValidationError(
                        loadedAccountInfo ? undefined : mustBeDeployedMessage
                    );
                    return setReady(Boolean(loadedAccountInfo));
                })
                .catch(() => {
                    setStatus(Status.Failed);
                    setAccountValidationError('Unable to reach node');
                    setReady(false);
                });
        } else {
            setAccountInfo(undefined);
            setReady(false);
            setStatus(Status.Pending);
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
    if (accountInfo) {
        accountDisplay = (
            <AccountCard account={fakeAccount} accountInfo={accountInfo} />
        );
    } else {
        accountDisplay = (
            <div className={styles.accountListElementPlaceholder}>
                <ConnectionStatusComponent
                    failedMessage={accountValidationError}
                    status={status}
                />
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
