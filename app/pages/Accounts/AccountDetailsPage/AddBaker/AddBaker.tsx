import { push, replace } from 'connected-react-router';
import { LocationDescriptorObject } from 'history';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router';
import { AddBakerForm } from '~/components/AddBakerDetailsForm';
import ensureExchangeRateAndNonce, {
    ExchangeRateAndNonceProps,
} from '~/components/Transfers/ensureExchangeRateAndNonce';
import routes from '~/constants/routes.json';
import { isMultiSig } from '~/utils/accountHelpers';
import { createTransferWithAccountRoute } from '~/utils/accountRouterHelpers';
import { multiplyFraction } from '~/utils/basicHelpers';
import { toMicroUnits } from '~/utils/gtu';
import { stringify } from '~/utils/JSONHelper';
import { BakerKeys } from '~/utils/rustInterface';
import { createAddBakerTransaction } from '~/utils/transactionHelpers';
import { AddBakerPayload, NotOptional, TransactionKindId } from '~/utils/types';
import { SubmitTransactionLocationState } from '../../SubmitTransaction/SubmitTransaction';
import GenerateBakerKeys from '../GenerateBakerKeys';
import AddBakerData from './AddBakerData';

const header = 'Add baker';

interface Props extends NotOptional<ExchangeRateAndNonceProps> {
    location: LocationDescriptorObject<AddBakerForm>;
}

const AddBaker = ensureExchangeRateAndNonce(
    ({ location, nonce, exchangeRate, account }: Props) => {
        const dispatch = useDispatch();
        const [bakerData, setBakerData] = useState<AddBakerForm>();

        const handleSubmit = useCallback(
            (values: AddBakerForm) => {
                setBakerData(values);
                dispatch(
                    push(
                        routes.ACCOUNTS_EXPORT_BAKER_KEYS.replace(
                            /^.*:bakerTransferType/,
                            routes.ACCOUNTS_ADD_BAKER
                        )
                    )
                );
            },
            [dispatch]
        );

        const makeTransaction = useCallback(
            (bakerKeys: BakerKeys) => {
                if (!account?.address || !bakerData) {
                    return undefined;
                }

                const { stake, restake } = bakerData;

                const payload: AddBakerPayload = {
                    electionVerifyKey: bakerKeys.electionPublic,
                    signatureVerifyKey: bakerKeys.signaturePublic,
                    aggregationVerifyKey: bakerKeys.aggregationPublic,
                    proofElection: bakerKeys.proofElection,
                    proofSignature: bakerKeys.proofSignature,
                    proofAggregation: bakerKeys.proofAggregation,
                    bakingStake: toMicroUnits(stake),
                    restakeEarnings: restake,
                };

                const transaction = createAddBakerTransaction(
                    account.address,
                    payload,
                    nonce
                );
                transaction.estimatedFee = multiplyFraction(
                    exchangeRate,
                    transaction.energyAmount
                );

                return transaction;
            },
            [account?.address, bakerData, exchangeRate, nonce]
        );

        const next = useCallback(
            async (bakerKeys: BakerKeys) => {
                if (!account) {
                    throw new Error('No account');
                }

                const transaction = makeTransaction(bakerKeys);
                const serialized = stringify(transaction);
                const state: SubmitTransactionLocationState<AddBakerForm> = {
                    account,
                    cancelled: {
                        pathname: routes.ACCOUNTS_ADD_BAKER,
                        state: bakerData,
                    },
                    confirmed: {
                        pathname: routes.ACCOUNTS_FINAL_PAGE,
                        state: {
                            transaction: serialized,
                        },
                    },
                    transaction: serialized,
                };
                dispatch(replace({ pathname: routes.SUBMITTRANSFER, state }));
            },
            [dispatch, makeTransaction, bakerData, account]
        );

        if (isMultiSig(account)) {
            return (
                <Redirect
                    to={createTransferWithAccountRoute(
                        TransactionKindId.Add_baker,
                        account
                    )}
                />
            );
        }

        return (
            <Switch>
                <Route path={routes.ACCOUNTS_EXPORT_BAKER_KEYS}>
                    {bakerData ? (
                        <GenerateBakerKeys
                            onContinue={next}
                            header={header}
                            keyVariant="ADD"
                        />
                    ) : (
                        <Redirect to={routes.ACCOUNTS_ADD_BAKER} />
                    )}
                </Route>
                <Route path={routes.ACCOUNTS_ADD_BAKER}>
                    <AddBakerData
                        header={header}
                        onSubmit={handleSubmit}
                        initialData={location.state}
                        exchangeRate={exchangeRate}
                    />
                </Route>
            </Switch>
        );
    }
);

export default AddBaker;
