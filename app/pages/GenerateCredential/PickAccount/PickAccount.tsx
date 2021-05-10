import React, { useState, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Redirect, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Account, AccountInfo, AccountStatus } from '~/utils/types';
import AccountCard from '~/components/AccountCard';
import { isValidAddress } from '~/utils/accountHelpers';
import { getAccountInfoOfAddress } from '~/utils/nodeHelpers';
import Button from '~/cross-app-components/Button';
import RevealAttributes from '../RevealAttributes';
import routes from '~/constants/routes.json';
import ConnectionStatusComponent, {
    Status,
} from '~/components/ConnectionStatusComponent';
import generateCredentialContext from '../GenerateCredentialContext';

import generalStyles from '../GenerateCredential.module.scss';
import styles from './PickAccount.module.scss';

const addressLength = 50;
const mustBeDeployedMessage = 'Address must belong to an deployed account';
const invalidAddres = 'Address format is invalid';

interface Props {
    setAccountValidationError: (error?: string) => void;
    accountValidationError?: string;
}

/**
 * Displays the currently chosen account's information.
 * Allows the user to reveal attributes.
 */
export default function PickAccount({
    accountValidationError,
    setAccountValidationError,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const location = useLocation().pathname;
    const {
        address: [address],
        identity: [identity],
        isReady: [isReady, setReady],
        attributes: [, setChosenAttributes],
    } = useContext(generateCredentialContext);

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

    if (!identity) {
        return <Redirect to={routes.GENERATE_CREDENTIAL_PICKIDENTITY} />;
    }

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
                    failedMessage={accountValidationError}
                    status={status}
                />
            </div>
        );
    }

    const isRevealAttributesRoute =
        location === routes.GENERATE_CREDENTIAL_REVEALATTRIBUTES;

    return (
        <>
            <div className={styles.accountWrapper}>
                {accountDisplay}
                {isRevealAttributesRoute && (
                    <RevealAttributes
                        setChosenAttributes={setChosenAttributes}
                        identity={identity}
                    />
                )}
            </div>
            {!isRevealAttributesRoute && accountInfo && (
                <Button
                    className={styles.button}
                    inverted
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
