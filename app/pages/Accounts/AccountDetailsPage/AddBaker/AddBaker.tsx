import React, {
    ComponentType,
    createContext,
    useContext,
    useState,
} from 'react';
import { connect } from 'react-redux';
import AddBakerStakeSettings, {
    StakeSettings,
} from '~/components/BakerTransactions/AddBakerStakeSettings';
import Form from '~/components/Form';
import Radios from '~/components/Form/Radios';
import withExchangeRate, {
    ExchangeRate,
} from '~/components/Transfers/withExchangeRate';
import withNonce, { AccountAndNonce } from '~/components/Transfers/withNonce';
import Button from '~/cross-app-components/Button';
import { chosenAccountSelector } from '~/features/AccountSlice';
import { RootState } from '~/store/store';
import { useTransactionCostEstimate } from '~/utils/dataHooks';
import {
    Account,
    EqualRecord,
    NotOptional,
    PropsOf,
    TransactionKindId,
} from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import AccountTransactionFlow, {
    FlowPageProps,
    AccountTransactionFlowLoading,
} from '../../AccountTransactionFlow';

import styles from './AddBaker.module.scss';

type PoolOpenSettings = boolean;

interface CommissionSettings {
    transactionFee: number;
    bakingReward: number;
    finalizationReward: number;
}

type Dependencies = ChainData & ExchangeRate & AccountAndNonce;

const dependencies = createContext<NotOptional<Dependencies>>(
    {} as NotOptional<Dependencies>
);

const title = 'Add baker';

type StakePageProps = FlowPageProps<StakeSettings>;

function StakePage({ onNext, initial }: StakePageProps) {
    const { blockSummary, exchangeRate, account } = useContext(dependencies);
    const minimumStake = BigInt(
        blockSummary.updates.chainParameters.minimumThresholdForBaking
    );
    const estimatedFee = useTransactionCostEstimate(
        TransactionKindId.Add_baker, // TODO: change this to the correct transaction.
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
            buttonClassName={styles.mainButton}
        />
    );
}

type PoolOpenPageProps = FlowPageProps<PoolOpenSettings>;

function PoolOpenPage({ initial = true, onNext }: PoolOpenPageProps) {
    const [value, setValue] = useState(initial);
    return (
        <>
            <p>
                You have the option to open your baker as a pool for others to
                delegate their CCD to.
            </p>
            <Radios
                className="mT50"
                options={[
                    { label: 'Open pool', value: true },
                    { label: 'Keep closed', value: false },
                ]}
                value={value}
                onChange={setValue}
            />
            <Button className={styles.mainButton} onClick={() => onNext(value)}>
                Continue
            </Button>
        </>
    );
}

type CommissionsPageProps = FlowPageProps<CommissionSettings>;

const commissionsFieldNames: EqualRecord<CommissionSettings> = {
    transactionFee: 'transactionFee',
    bakingReward: 'bakingReward',
    finalizationReward: 'finalizationReward',
};

const commonSliderProps: Pick<
    PropsOf<typeof Form.Slider>,
    'step' | 'unit' | 'className'
> = {
    step: 0.01,
    unit: '%',
    className: 'mB20',
};

function CommissionsPage({ initial, onNext }: CommissionsPageProps) {
    const boundaries: {
        [P in keyof CommissionSettings]: [number, number];
    } = {
        transactionFee: [5, 15],
        bakingReward: [5, 15],
        finalizationReward: [5, 15],
    };
    const defaultValues: CommissionSettings = {
        transactionFee: boundaries.transactionFee[1],
        bakingReward: boundaries.bakingReward[1],
        finalizationReward: boundaries.finalizationReward[1],
    };

    return (
        <Form<CommissionSettings>
            onSubmit={onNext}
            defaultValues={initial ?? defaultValues}
        >
            <p>
                When you open your baker as a pool, you have to set commission
                rates. You can do so below:
            </p>
            <Form.Slider
                label="Transaction fee commissions"
                name={commissionsFieldNames.transactionFee}
                min={boundaries.transactionFee[0]}
                max={boundaries.transactionFee[1]}
                {...commonSliderProps}
            />
            <Form.Slider
                label="Baking reward commissions"
                name={commissionsFieldNames.bakingReward}
                min={boundaries.bakingReward[0]}
                max={boundaries.bakingReward[1]}
                {...commonSliderProps}
            />
            <Form.Slider
                label="Finalization reward commissions"
                name={commissionsFieldNames.finalizationReward}
                min={boundaries.finalizationReward[0]}
                max={boundaries.finalizationReward[1]}
                {...commonSliderProps}
            />
            <Form.Submit className={styles.mainButton}>Continue</Form.Submit>
        </Form>
    );
}

interface AddBakerState {
    stake: StakeSettings;
    poolOpen: PoolOpenSettings;
    commissions: CommissionSettings;
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
            <AccountTransactionFlow<AddBakerState>
                title={title}
                // eslint-disable-next-line no-console
                onDone={(values) => console.log(values)}
            >
                {{
                    stake: { component: StakePage },
                    poolOpen: { component: PoolOpenPage },
                    commissions: { component: CommissionsPage },
                }}
            </AccountTransactionFlow>
        </dependencies.Provider>
    );
});
