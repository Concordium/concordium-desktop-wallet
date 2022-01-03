import React, { useEffect, useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { chooseAccount, removeAccount } from '~/features/AccountSlice';
import { chooseIdentity } from '~/features/IdentitySlice';
import ChoiceModal from '~/components/ChoiceModal';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import routes from '~/constants/routes.json';
import { Account, AccountStatus } from '~/utils/types';

interface Props {
    account: Account;
}

/**
 * Modal, which appears on rejected initial accounts.
 */
export default function FailedAccountModal({ account }: Props) {
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
        <>
            <SimpleErrorModal
                disableClose={false}
                header="Identity issuance failed"
                content={`Unfortunately something went wrong with this account's identity (${account.identityName}). This account is therefore not valid. The account will be automatically removed when you delete the related failed identity.`}
                show={modalOpen && account.isInitial}
                buttonText="Go to identity"
                onClick={() => {
                    // Remove chosen account, to avoid triggering this modal, when returning to account page.
                    dispatch(chooseAccount(''));
                    dispatch(chooseIdentity(account.identityId));
                    dispatch(push(routes.IDENTITIES));
                }}
            />
            <ChoiceModal
                disableClose
                title="Account creation failed"
                description="Unfortunately something went wrong with creating this account. It is therefore not valid. You can remove it or leave it."
                open={modalOpen && !account.isInitial}
                actions={[
                    {
                        label: 'Remove from wallet',
                        action: () => removeAccount(dispatch, account.address),
                    },
                    {
                        label: 'Leave it',
                    },
                ]}
                postAction={() => {
                    dispatch(chooseAccount(''));
                    setModalOpen(false);
                }}
            />
        </>
    );
}
