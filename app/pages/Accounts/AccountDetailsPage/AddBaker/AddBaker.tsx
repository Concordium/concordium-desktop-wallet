import React, { ComponentType, createContext, useContext } from 'react';
import { connect } from 'react-redux';
import AddBakerStakeSettings, {
    StakeSettings,
} from '~/components/BakerTransactions/AddBakerStakeSettings';
import withExchangeRate, {
    ExchangeRate,
} from '~/components/Transfers/withExchangeRate';
import withNonce, { AccountAndNonce } from '~/components/Transfers/withNonce';
import { chosenAccountSelector } from '~/features/AccountSlice';
import { RootState } from '~/store/store';
import { useTransactionCostEstimate } from '~/utils/dataHooks';
import { Account, NotOptional, TransactionKindId } from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import AccountTransactionFlow, {
    FlowPageProps,
    AccountTransactionFlowLoading,
} from '../../AccountTransactionFlow';

type PoolOpen = boolean;

type Dependencies = ChainData & ExchangeRate & AccountAndNonce;

const dependencies = createContext<NotOptional<Dependencies>>(
    {} as NotOptional<Dependencies>
);

const title = 'Add baker';

interface BakerState {
    stake: StakeSettings;
    poolOpen: PoolOpen;
}

type StakePageProps = FlowPageProps<StakeSettings>;
type PoolOpenPageProps = FlowPageProps<PoolOpen>;

function BakerDetailsPage({ onNext, initial }: StakePageProps) {
    const { blockSummary, exchangeRate, account } = useContext(dependencies);
    const minimumStake = BigInt(
        blockSummary.updates.chainParameters.minimumThresholdForBaking
    );
    const estimatedFee = useTransactionCostEstimate(
        TransactionKindId.Add_baker,
        exchangeRate,
        account?.signatureThreshold
    );

    return (
        <AddBakerStakeSettings
            onSubmit={onNext}
            initialData={initial}
            account={account}
            estimatedFee={estimatedFee}
            minimumStake={minimumStake}
        />
    );
}

function PoolOpenPage({ initial }: PoolOpenPageProps) {
    return <>Pool open settings: {initial ? 'Yes' : 'No'}</>;
}

type Props = Dependencies;

const withData = (component: ComponentType<Props>) =>
    connect((s: RootState) => ({
        account: chosenAccountSelector(s) as Account,
    }))(withNonce(withExchangeRate(withChainData(component))));

export default withData(function AddBaker(props: Props) {
    const loading = Object.values(props).some((v) => !v);

    if (loading) {
        return <AccountTransactionFlowLoading title={title} />;
    }

    return (
        <dependencies.Provider value={props as NotOptional<Dependencies>}>
            <AccountTransactionFlow<BakerState>
                title={title}
                serializeTransaction={(values) => JSON.stringify(values)}
            >
                {{
                    stake: { component: BakerDetailsPage },
                    poolOpen: { component: PoolOpenPage },
                }}
            </AccountTransactionFlow>
        </dependencies.Provider>
    );
});
