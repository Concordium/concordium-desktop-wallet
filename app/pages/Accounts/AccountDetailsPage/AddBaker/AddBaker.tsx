import { push, replace } from 'connected-react-router';
import { LocationDescriptorObject } from 'history';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import { AddBakerForm } from '~/components/AddBakerDetailsForm';
import routes from '~/constants/routes.json';
import { chosenAccountSelector } from '~/features/AccountSlice';
import { getNextAccountNonce } from '~/node/nodeRequests';
import { toMicroUnits } from '~/utils/gtu';
import { stringify } from '~/utils/JSONHelper';
import { BakerKeys } from '~/utils/rustInterface';
import { createAddBakerTransaction } from '~/utils/transactionHelpers';
import { AddBakerPayload } from '~/utils/types';
import { SubmitTransferLocationState } from '../../SubmitTransfer/SubmitTransfer';
import GenerateBakerKeys from '../GenerateBakerKeys';
import AddBakerData from './AddBakerData';

const header = 'Add baker';

interface Props {
    location: LocationDescriptorObject<AddBakerForm>;
}

export default function AddBaker({ location }: Props) {
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector);
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
        async (bakerKeys: BakerKeys) => {
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

            const accountNonce = await getNextAccountNonce(account.address);

            return createAddBakerTransaction(
                account.address,
                payload,
                accountNonce.nonce
            );
        },
        [account?.address, bakerData]
    );

    const next = useCallback(
        async (bakerKeys: BakerKeys) => {
            if (!account) {
                throw new Error('No account');
            }

            const transaction = await makeTransaction(bakerKeys);

            const state: SubmitTransferLocationState<AddBakerForm> = {
                account,
                cancelled: {
                    pathname: routes.ACCOUNTS_ADD_BAKER,
                    state: bakerData,
                },
                confirmed: {
                    pathname: routes.ACCOUNTS,
                },
                transaction: stringify(transaction),
            };
            dispatch(replace({ pathname: routes.SUBMITTRANSFER, state }));
        },
        [dispatch, makeTransaction, bakerData, account]
    );

    return (
        <Switch>
            <Route path={routes.ACCOUNTS_EXPORT_BAKER_KEYS}>
                <GenerateBakerKeys onContinue={next} header={header} />
            </Route>
            <Route path={routes.ACCOUNTS_ADD_BAKER}>
                <AddBakerData
                    header={header}
                    onSubmit={handleSubmit}
                    initialData={location.state}
                />
            </Route>
        </Switch>
    );
}
