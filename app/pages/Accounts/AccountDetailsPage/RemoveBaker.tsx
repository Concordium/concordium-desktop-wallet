import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Redirect } from 'react-router';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import routes from '~/constants/routes.json';
import { getNextAccountNonce } from '~/node/nodeRequests';
import { stringify } from '~/utils/JSONHelper';
import { createRemoveBakerTransaction } from '~/utils/transactionHelpers';
import { SubmitTransactionLocationState } from '../SubmitTransaction/SubmitTransaction';

import styles from './AccountDetailsPage.module.scss';
import { multiplyFraction } from '~/utils/basicHelpers';
import { getEnergyToMicroGtuRate } from '~/node/nodeHelpers';
import BakerPendingChange from '~/components/BakerPendingChange';
import { Account, AccountInfo, TransactionKindId } from '~/utils/types';
import { useCalcBakerStakeCooldownUntil } from '~/utils/dataHooks';
import { getFormattedDateString } from '~/utils/timeHelpers';
import { isMultiSig } from '~/utils/accountHelpers';
import { createTransferWithAccountRoute } from '~/utils/accountRouterHelpers';

interface Props {
    account: Account;
    accountInfo?: AccountInfo;
}

export default function RemoveBaker({ account, accountInfo }: Props) {
    const dispatch = useDispatch();
    const cooldownUntil = useCalcBakerStakeCooldownUntil();

    const pendingChange = accountInfo?.accountBaker?.pendingChange;

    const next = useCallback(async () => {
        if (!account) {
            throw new Error('No account selected');
        }

        const { nonce } = await getNextAccountNonce(account.address);
        const transaction = await createRemoveBakerTransaction(
            account.address,
            nonce
        );
        const exchangeRate = await getEnergyToMicroGtuRate();

        transaction.estimatedFee = multiplyFraction(
            exchangeRate,
            transaction.energyAmount
        );
        const serialized = stringify(transaction);
        const state: SubmitTransactionLocationState = {
            account,
            transaction: serialized,
            cancelled: {
                pathname: routes.ACCOUNTS_REMOVE_BAKER,
            },
            confirmed: {
                pathname: routes.ACCOUNTS_FINAL_PAGE,
                state: {
                    transaction: serialized,
                },
            },
        };

        dispatch(push({ pathname: routes.SUBMITTRANSFER, state }));
    }, [dispatch, account]);

    if (isMultiSig(account)) {
        return (
            <Redirect
                to={createTransferWithAccountRoute(
                    TransactionKindId.Remove_baker,
                    account
                )}
            />
        );
    }

    return (
        <Card className="textCenter pB40">
            <h3 className="bodyEmphasized">Remove baker</h3>
            {pendingChange ? (
                <p className="mT30 mB0">
                    Cannot remove baker at this time:
                    <div className="bodyEmphasized textError mV10">
                        <BakerPendingChange pending={pendingChange} />
                    </div>
                    It will be possible to proceed after this time has passed.
                </p>
            ) : (
                <>
                    <p className="mT30">
                        This will remove the baker status of the account. After
                        the grace period the full staked amount will be unlocked
                        for disposal.
                        {cooldownUntil && (
                            <>
                                <br />
                                <br />
                                The grace period lasts until
                                <div className="bodyEmphasized  mV10">
                                    {getFormattedDateString(cooldownUntil)}.
                                </div>
                            </>
                        )}
                    </p>
                    <Button onClick={next} className={styles.bakerFlowContinue}>
                        Continue
                    </Button>
                </>
            )}
        </Card>
    );
}
