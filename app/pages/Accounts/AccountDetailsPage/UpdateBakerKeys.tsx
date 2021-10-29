import React, { useCallback } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { useDispatch } from 'react-redux';
import { push, replace } from 'connected-react-router';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import routes from '~/constants/routes.json';
import GenerateBakerKeys from './GenerateBakerKeys';
import { BakerKeys } from '~/utils/rustInterface';
import {
    Account,
    TransactionKindId,
    UpdateBakerKeysPayload,
} from '~/utils/types';
import { getNextAccountNonce } from '~/node/nodeRequests';
import { createUpdateBakerKeysTransaction } from '~/utils/transactionHelpers';
import { SubmitTransactionLocationState } from '../SubmitTransaction/SubmitTransaction';
import { stringify } from '~/utils/JSONHelper';
import { multiplyFraction } from '~/utils/basicHelpers';
import { getEnergyToMicroGtuRate } from '~/node/nodeHelpers';
import { isMultiSig } from '~/utils/accountHelpers';
import { createTransferWithAccountRoute } from '~/utils/accountRouterHelpers';

import styles from './AccountDetailsPage.module.scss';

const header = 'Update baker keys';

function UpdateBakerKeysIntro() {
    const dispatch = useDispatch();
    const next = useCallback(() => {
        dispatch(
            push(
                routes.ACCOUNTS_EXPORT_BAKER_KEYS.replace(
                    /^.*:bakerTransferType/,
                    routes.ACCOUNTS_UPDATE_BAKER_KEYS
                )
            )
        );
    }, [dispatch]);

    return (
        <Card className="textCenter pB40">
            <h3 className="bodyEmphasized">{header}</h3>
            <p className="mT30">
                Before updating your baker keys, you must first generate a new
                set of baker credentials. You can do so by pressing the button
                below.
            </p>
            <Button onClick={next} className={styles.bakerFlowContinue}>
                Generate new keys
            </Button>
        </Card>
    );
}

interface Props {
    account: Account;
}

export default function UpdateBakerKeys({ account }: Props) {
    const dispatch = useDispatch();

    const makeTransaction = useCallback(
        async (bakerKeys: BakerKeys) => {
            if (!account?.address) {
                return undefined;
            }

            const payload: UpdateBakerKeysPayload = {
                electionVerifyKey: bakerKeys.electionPublic,
                signatureVerifyKey: bakerKeys.signaturePublic,
                aggregationVerifyKey: bakerKeys.aggregationPublic,
                proofElection: bakerKeys.proofElection,
                proofSignature: bakerKeys.proofSignature,
                proofAggregation: bakerKeys.proofAggregation,
            };

            const accountNonce = await getNextAccountNonce(account.address);
            const exchangeRate = await getEnergyToMicroGtuRate();

            const transaction = createUpdateBakerKeysTransaction(
                account.address,
                payload,
                accountNonce.nonce
            );
            transaction.estimatedFee = multiplyFraction(
                exchangeRate,
                transaction.energyAmount
            );

            return transaction;
        },
        [account?.address]
    );

    const next = useCallback(
        async (bakerKeys: BakerKeys) => {
            if (!account) {
                throw new Error('No account selected');
            }

            const transaction = await makeTransaction(bakerKeys);
            const serialized = stringify(transaction);
            const state: SubmitTransactionLocationState = {
                account,
                transaction: serialized,
                cancelled: {
                    pathname: routes.ACCOUNTS_UPDATE_BAKER_KEYS,
                },
                confirmed: {
                    pathname: routes.ACCOUNTS_FINAL_PAGE,
                    state: {
                        transaction: serialized,
                    },
                },
            };

            dispatch(replace({ pathname: routes.SUBMITTRANSFER, state }));
        },
        [makeTransaction, dispatch, account]
    );

    if (isMultiSig(account)) {
        return (
            <Redirect
                to={createTransferWithAccountRoute(
                    TransactionKindId.Update_baker_keys,
                    account
                )}
            />
        );
    }

    return (
        <Switch>
            <Route path={routes.ACCOUNTS_EXPORT_BAKER_KEYS}>
                <GenerateBakerKeys
                    header={header}
                    onContinue={next}
                    keyVariant="UPDATE"
                />
            </Route>
            <Route component={UpdateBakerKeysIntro} />
        </Switch>
    );
}
