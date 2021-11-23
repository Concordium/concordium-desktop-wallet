import React from 'react';
import { useSelector } from 'react-redux';
import { specificIdentitySelector } from '~/features/IdentitySlice';
import Modal from '~/cross-app-components/Modal';
import { Account } from '~/utils/types';
import { noOp, asyncNoOp } from '~/utils/basicHelpers';
import { globalSelector } from '~/features/GlobalSlice';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import errorMessages from '~/constants/errorMessages.json';
import findLocalDeployedCredentialWithWallet from '~/utils/credentialHelper';
import Ledger from '~/components/ledger/Ledger';
import Card from '~/cross-app-components/Card';
import Button from '~/cross-app-components/Button';

export interface DecryptModalInput {
    show: boolean;
    header?: string;
    account?: Account;
    onFinish?: (
        decrypted: boolean,
        address: string,
        credentialNumber: number,
        prfKeySeed: string
    ) => void;
}

/**
 * A modal that contains a 'decrypt' component that is used as part of the account report,
 * when the user has encrypted transfers. The component does not actually perform any decryption,
 * but it is used to get the necessary input to perform decryption later.
 */
export default function DecryptModal({
    show,
    account,
    header,
    onFinish = noOp,
}: DecryptModalInput) {
    const global = useSelector(globalSelector);
    const identity = useSelector(specificIdentitySelector(account?.identityId));

    async function ledgerCall(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        if (!account) {
            throw new Error('Missing account');
        }

        if (!global) {
            throw new Error(errorMessages.missingGlobal);
        }

        if (identity === undefined) {
            throw new Error(
                'The identity was not found. This is an internal error that should be reported'
            );
        }

        if (account.identityNumber === undefined) {
            throw new Error(
                'The account is missing an identity number. This is an internal error that should be reported'
            );
        }

        const credential = await findLocalDeployedCredentialWithWallet(
            account.address,
            ledger
        );
        if (credential === undefined) {
            throw new Error(
                'Unable to decrypt shielded balance and encrypted transfers. Please verify that the connected wallet is for this account.'
            );
        }
        const { credentialNumber } = credential;

        setMessage('Please accept decrypt on device');
        const prfKeySeed = await ledger.getPrfKeyDecrypt(
            credential.identityNumber,
            identity.version
        );
        setMessage('Please wait');
        const prfKey = prfKeySeed.toString('hex');

        onFinish(true, account.address, credentialNumber, prfKey);
    }

    return (
        <Modal open={show} onClose={() => onFinish(false, '', -1, '')}>
            <h2 className="mB30">{header}</h2>
            <Ledger ledgerCallback={ledgerCall}>
                {({ isReady, statusView, submitHandler = asyncNoOp }) => (
                    <Card className="flexColumn textCenter">
                        <h3 className="mB40">Decrypt shielded balance</h3>
                        {statusView}
                        <Button
                            size="big"
                            disabled={!isReady}
                            className="m40"
                            onClick={submitHandler}
                        >
                            Decrypt
                        </Button>
                    </Card>
                )}
            </Ledger>
        </Modal>
    );
}
