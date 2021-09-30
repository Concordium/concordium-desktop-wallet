import React from 'react';
import { useSelector } from 'react-redux';
import AddBakerDetailsForm, {
    AddBakerForm,
} from '~/components/AddBakerDetailsForm';
import {
    ensureExchangeRate,
    ExchangeRate,
} from '~/components/Transfers/withExchangeRate';
import Card from '~/cross-app-components/Card';
import Loading from '~/cross-app-components/Loading';
import { chosenAccountSelector } from '~/features/AccountSlice';
import {
    ChainData,
    ensureChainData,
} from '~/pages/multisig/common/withChainData';
import { useTransactionCostEstimate } from '~/utils/dataHooks';
import { NotOptional, TransactionKindId } from '~/utils/types';

interface Props extends NotOptional<ChainData>, NotOptional<ExchangeRate> {
    onSubmit(values: AddBakerForm): void;
}

function AddBaker({ blockSummary, exchangeRate, onSubmit }: Props) {
    const account = useSelector(chosenAccountSelector);
    const minimumThresholdForBaking = BigInt(
        blockSummary.updates.chainParameters.minimumThresholdForBaking
    );

    if (!account) {
        throw new Error('No chosen account.');
    }

    const estimatedFee = useTransactionCostEstimate(
        TransactionKindId.Add_baker,
        exchangeRate,
        account?.signatureThreshold
    );

    return (
        <Card>
            <h5>Add baker</h5>
            <AddBakerDetailsForm
                minimumStake={minimumThresholdForBaking}
                account={account}
                estimatedFee={estimatedFee}
                onSubmit={onSubmit}
            />
        </Card>
    );
}

export default ensureExchangeRate(ensureChainData(AddBaker, Loading), Loading);
