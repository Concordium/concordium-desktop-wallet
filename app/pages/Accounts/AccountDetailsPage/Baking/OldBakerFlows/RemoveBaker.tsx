import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { goBack, push } from 'connected-react-router';
import { Redirect } from 'react-router';
import { isBakerAccount } from '@concordium/node-sdk/lib/src/accountHelpers';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import routes from '~/constants/routes.json';
import { stringify } from '~/utils/JSONHelper';
import { createRemoveBakerTransaction } from '~/utils/transactionHelpers';
import { SubmitTransactionLocationState } from '../../../SubmitTransaction/SubmitTransaction';
import { multiplyFraction } from '~/utils/basicHelpers';
import StakePendingChange from '~/components/StakePendingChange';
import { AccountInfo, NotOptional, TransactionKindId } from '~/utils/types';
import { useCalcBakerStakeCooldownUntil } from '~/utils/dataHooks';
import { getFormattedDateString } from '~/utils/timeHelpers';
import { isMultiSig } from '~/utils/accountHelpers';
import { createTransferWithAccountRoute } from '~/utils/accountRouterHelpers';
import ensureExchangeRateAndNonce, {
    ExchangeRateAndNonceProps,
} from '~/components/Transfers/ensureExchangeRateAndNonce';
import BackButton from '~/cross-app-components/BackButton';

import styles from '../../AccountDetailsPage.module.scss';

interface Props extends NotOptional<ExchangeRateAndNonceProps> {
    accountInfo?: AccountInfo;
}

export default ensureExchangeRateAndNonce(function RemoveBaker({
    account,
    accountInfo,
    nonce,
    exchangeRate,
}: Props) {
    const dispatch = useDispatch();
    const cooldownUntil = useCalcBakerStakeCooldownUntil();

    const next = useCallback(() => {
        if (!account) {
            throw new Error('No account selected');
        }

        const transaction = createRemoveBakerTransaction(
            account.address,
            nonce
        );

        transaction.estimatedFee = multiplyFraction(
            exchangeRate,
            transaction.energyAmount
        );
        const serialized = stringify(transaction);
        const state: SubmitTransactionLocationState = {
            account,
            transaction: serialized,
            confirmed: {
                pathname: routes.ACCOUNTS_FINAL_PAGE,
                state: {
                    transaction: serialized,
                },
            },
        };

        dispatch(push({ pathname: routes.SUBMITTRANSFER, state }));
    }, [dispatch, account, nonce, exchangeRate]);

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

    const pendingChange =
        accountInfo !== undefined && isBakerAccount(accountInfo)
            ? accountInfo.accountBaker.pendingChange
            : undefined;

    return (
        <Card className="textCenter pB40 relative">
            <BackButton
                className={styles.backButton}
                onClick={() => dispatch(goBack())}
            />
            <h3 className="bodyEmphasized">Remove baker</h3>
            {pendingChange ? (
                <p className="mT30 mB0">
                    Cannot remove baker at this time:
                    <div className="bodyEmphasized textError mV10">
                        <StakePendingChange pending={pendingChange} />
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
});
