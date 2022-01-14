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
import Input from '~/components/Form/Input';
import Radios from '~/components/Form/Radios';
import withExchangeRate, {
    ExchangeRate,
} from '~/components/Transfers/withExchangeRate';
import withNonce, { AccountAndNonce } from '~/components/Transfers/withNonce';
import Button from '~/cross-app-components/Button';
import { chosenAccountSelector } from '~/features/AccountSlice';
import { RootState } from '~/store/store';
import { isDefined, multiplyFraction } from '~/utils/basicHelpers';
import { useTransactionCostEstimate } from '~/utils/dataHooks';
import { toMicroUnits } from '~/utils/gtu';
import { BakerKeys } from '~/utils/rustInterface';
import { createAddBakerTransaction } from '~/utils/transactionHelpers';
import {
    Account,
    AddBaker as AddBakerTransaction,
    AddBakerPayload,
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
import GenerateBakerKeys from '../GenerateBakerKeys';

import styles from '../AccountDetailsPage.module.scss';

type PoolOpen = boolean;

interface CommissionSettings {
    transactionFee: number;
    bakingReward: number;
    finalizationReward: number;
}

type MetadataUrl = string;

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
            buttonClassName={styles.bakerFlowContinue}
        />
    );
}

type PoolOpenPageProps = FlowPageProps<PoolOpen>;

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
            <Button
                className={styles.bakerFlowContinue}
                onClick={() => onNext(value)}
            >
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
    step: 0.001,
    unit: '%',
    className: 'mB30',
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
            <p className="mB30">
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
            <Form.Submit className={styles.bakerFlowContinue}>
                Continue
            </Form.Submit>
        </Form>
    );
}

type MetadataUrlPageProps = FlowPageProps<MetadataUrl>;

const MetadataUrlPage = ({ onNext, initial = '' }: MetadataUrlPageProps) => {
    const [value, setValue] = useState<MetadataUrl>(initial);
    return (
        <>
            <p className="mB30">
                You can choose to add a URL with metadata about your baker.
                Leave it blank if you don&apos;t have any.
            </p>
            <Input
                className="body2"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter metadata URL"
            />
            <Button
                className={styles.bakerFlowContinue}
                onClick={() => onNext(value)}
            >
                Continue
            </Button>
        </>
    );
};

type GenerateKeysPageProps = FlowPageProps<BakerKeys>;

const GenerateKeysPage = ({ onNext, initial }: GenerateKeysPageProps) => {
    const { account } = useContext(dependencies);

    return (
        <GenerateBakerKeys
            onContinue={onNext}
            account={account}
            initialKeys={initial}
            keyVariant="ADD"
        />
    );
};

interface AddBakerState {
    stake: StakeSettings;
    poolOpen: PoolOpen;
    commissions: CommissionSettings;
    metadataUrl: MetadataUrl;
    keys: BakerKeys;
}

type Props = Dependencies;

const withData = (component: ComponentType<Props>) =>
    connect((s: RootState) => ({
        account: chosenAccountSelector(s) as Account,
    }))(withNonce(withExchangeRate(withChainData(component))));

const hasNecessaryProps = (props: Props): props is NotOptional<Props> => {
    return [props.exchangeRate, props.nonce, props.blockSummary].every(
        isDefined
    );
};

export default withData(function AddBaker(props: Props) {
    if (!hasNecessaryProps(props)) {
        return <AccountTransactionFlowLoading title={title} />;
    }

    const { nonce, account, exchangeRate } = props;

    function convertToTransaction({
        stake,
        keys,
    }: AddBakerState): AddBakerTransaction {
        const payload: AddBakerPayload = {
            electionVerifyKey: keys.electionPublic,
            signatureVerifyKey: keys.signaturePublic,
            aggregationVerifyKey: keys.aggregationPublic,
            proofElection: keys.proofElection,
            proofSignature: keys.proofSignature,
            proofAggregation: keys.proofAggregation,
            bakingStake: toMicroUnits(stake.stake),
            restakeEarnings: stake.restake,
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
    }

    return (
        <dependencies.Provider value={props as NotOptional<Dependencies>}>
            <AccountTransactionFlow<AddBakerState, AddBakerTransaction>
                title={title}
                convert={convertToTransaction}
            >
                {{
                    stake: { component: StakePage },
                    poolOpen: { component: PoolOpenPage },
                    commissions: { component: CommissionsPage },
                    metadataUrl: { component: MetadataUrlPage },
                    keys: { component: GenerateKeysPage },
                }}
            </AccountTransactionFlow>
        </dependencies.Provider>
    );
});
