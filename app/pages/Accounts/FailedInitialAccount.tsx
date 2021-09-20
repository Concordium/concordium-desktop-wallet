import React, { useState, useEffect } from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { chooseAccount } from '~/features/AccountSlice';
import { chooseIdentity } from '~/features/IdentitySlice';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import routes from '~/constants/routes.json';
import { Account, AccountStatus } from '~/utils/types';

interface Props {
    account: Account;
}

/**
 * Modal, which appears on rejected initial accounts.
 */
export default function FailedInitialAccountModal({ account }: Props) {
    const dispatch = useDispatch();
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (account.status === AccountStatus.Rejected) {
            setModalOpen(true);
        } else {
            setModalOpen(false);
        }
    }, [account.status, setModalOpen]);

    return (
        <SimpleErrorModal
            disableClose={false}
            header="Identity issuance failed"
            content={`Unfortunately something went wrong with this account's identity (${account.identityName}). This account is therefore not valid.`}
            show={modalOpen}
            buttonText="Go to identity"
            onClick={() => {
                // Remove chosen account, to avoid triggering this modal, when returning to account page.
                dispatch(chooseAccount(''));
                dispatch(chooseIdentity(account.identityId));
                dispatch(push(routes.IDENTITIES));
            }}
        />
    );
}
