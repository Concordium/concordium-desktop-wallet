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
import { NotOptional, PropsOf, TransactionKindId } from '~/utils/types';

type FormWrapperProps = Omit<
    PropsOf<typeof AddBakerDetailsForm>,
    'minimumStake' | 'estimatedFee'
> &
    NotOptional<ChainData> &
    NotOptional<ExchangeRate>;

const LoadingChainData = () => <Loading text="Loading chain data" inline />;

const FormWrapper = ensureExchangeRate(
    ensureChainData(
        ({ blockSummary, exchangeRate, ...props }: FormWrapperProps) => {
            const { account } = props;
            const minimumStake = BigInt(
                blockSummary.updates.chainParameters.minimumThresholdForBaking
            );
            const estimatedFee = useTransactionCostEstimate(
                TransactionKindId.Add_baker,
                exchangeRate,
                account?.signatureThreshold
            );

            return (
                <AddBakerDetailsForm
                    {...props}
                    minimumStake={minimumStake}
                    estimatedFee={estimatedFee}
                />
            );
        },
        LoadingChainData
    ),
    LoadingChainData
);

interface Props {
    initialData?: AddBakerForm;
    onSubmit(values: AddBakerForm): void;
}

export default function AddBakerData({ onSubmit, initialData }: Props) {
    const account = useSelector(chosenAccountSelector);

    if (!account) {
        throw new Error('No chosen account.');
    }

    return (
        <Card className="textCenter">
            <h3>Add baker</h3>
            <FormWrapper
                account={account}
                onSubmit={onSubmit}
                initialData={initialData}
            />
        </Card>
    );
}
