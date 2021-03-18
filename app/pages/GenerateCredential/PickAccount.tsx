import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { useLocation } from 'react-router-dom';
import { Segment } from 'semantic-ui-react';
import {
    Account,
    AccountInfo,
    AccountStatus,
    Identity,
} from '../../utils/types';
import AccountListElement from '../../components/AccountListElement';
import { isValidAddress } from '../../utils/accountHelpers';
import { getAccountInfoOfAddress } from '../../utils/nodeHelpers';
import Button from '../../cross-app-components/Button';
import RevealAttributes from './RevealAttributes';
import routes from '../../constants/routes.json';

interface Props {
    setReady: (ready: boolean) => void;
    isReady: boolean;
    address: string;
    setChosenAttributes: (attributes: string[]) => void;
    identity: Identity | undefined;
}

/**
 * Displays the currently chosen account's information.
 * Allows the user to reveal attributes.
 */
export default function PickAccount({
    isReady,
    setReady,
    address,
    setChosenAttributes,
    identity,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const location = useLocation().pathname;

    if (!identity) {
        throw new Error('unexpected missing identity');
    }

    const [accountInfo, setAccountInfo] = useState<AccountInfo | undefined>(
        undefined
    );

    useEffect(() => {
        if (isValidAddress(address)) {
            getAccountInfoOfAddress(address)
                .then((loadedAccountInfo) => {
                    setAccountInfo(loadedAccountInfo);
                    return setReady(true);
                })
                .catch(() => setReady(false));
        } else {
            setAccountInfo(undefined);
            setReady(false);
        }
    }, [address, setReady, setAccountInfo]);

    const fakeAccount: Account = {
        status: AccountStatus.Confirmed,
        identityName: '',
        address,
        name: 'Account',
        identityId: -1,
        maxTransactionId: -1,
        isInitial: false,
    };

    return (
        <>
            <Segment textAlign="center" secondary loading={!accountInfo}>
                <AccountListElement
                    account={fakeAccount}
                    accountInfo={accountInfo}
                />
            </Segment>
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
