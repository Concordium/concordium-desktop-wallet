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
import { createConfigureBakerTransaction } from '~/utils/transactionHelpers';
import {
    Account,
    ConfigureBaker as ConfigureBakerTransaction,
    ConfigureBakerPayload,
    EqualRecord,
    MakeOptional,
    MakeRequired,
    NotOptional,
    OpenStatus,
    PropsOf,
    TransactionKindId,
} from '~/utils/types';
import withChainData, { ChainData } from '~/utils/withChainData';
import AccountTransactionFlow, {
    AccountTransactionFlowPageProps,
    AccountTransactionFlowLoading,
} from '../../AccountTransactionFlow';
import GenerateBakerKeys from '../GenerateBakerKeys';
import { ensureProps } from '~/utils/componentHelpers';

import styles from '../AccountDetailsPage.module.scss';

type Commissions = NotOptional<
    Pick<
        ConfigureBakerPayload,
        | 'transactionFeeCommission'
        | 'bakingRewardCommission'
        | 'finalizationRewardCommission'
    >
>;

type MetadataUrl = string;

type Dependencies = NotOptional<ChainData & ExchangeRate & AccountAndNonce>;

const dependencies = createContext<Dependencies>({} as Dependencies);

const title = 'Add baker';

function StakePage({
    onNext,
    initial,
}: AccountTransactionFlowPageProps<StakeSettings>) {
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

function OpenForDelegationPage({
    initial = OpenStatus.OpenForAll,
    onNext,
}: AccountTransactionFlowPageProps<OpenStatus>) {
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
                    { label: 'Open pool', value: OpenStatus.OpenForAll },
                    { label: 'Keep closed', value: OpenStatus.ClosedForAll },
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

const commissionsFieldNames: EqualRecord<Commissions> = {
    transactionFeeCommission: 'transactionFeeCommission',
    bakingRewardCommission: 'bakingRewardCommission',
    finalizationRewardCommission: 'finalizationRewardCommission',
};

const commonSliderProps: Pick<
    PropsOf<typeof Form.Slider>,
    'step' | 'unit' | 'className'
> = {
    step: 0.001,
    unit: '%',
    className: 'mB30',
};

function CommissionsPage({
    initial,
    onNext,
}: AccountTransactionFlowPageProps<Commissions>) {
    // TODO: get values from chain
    const boundaries: {
        [P in keyof Commissions]: [number, number];
    } = {
        transactionFeeCommission: [5, 15],
        bakingRewardCommission: [5, 15],
        finalizationRewardCommission: [5, 15],
    };
    const defaultValues: Commissions = {
        transactionFeeCommission: boundaries.transactionFeeCommission[1],
        bakingRewardCommission: boundaries.bakingRewardCommission[1],
        finalizationRewardCommission:
            boundaries.finalizationRewardCommission[1],
    };

    return (
        <Form<Commissions>
            onSubmit={onNext}
            defaultValues={initial ?? defaultValues}
        >
            <p className="mB30">
                When you open your baker as a pool, you have to set commission
                rates. You can do so below:
            </p>
            <Form.Slider
                label="Transaction fee commissions"
                name={commissionsFieldNames.transactionFeeCommission}
                min={boundaries.transactionFeeCommission[0]}
                max={boundaries.transactionFeeCommission[1]}
                {...commonSliderProps}
            />
            <Form.Slider
                label="Baking reward commissions"
                name={commissionsFieldNames.bakingRewardCommission}
                min={boundaries.bakingRewardCommission[0]}
                max={boundaries.bakingRewardCommission[1]}
                {...commonSliderProps}
            />
            <Form.Slider
                label="Finalization reward commissions"
                name={commissionsFieldNames.finalizationRewardCommission}
                min={boundaries.finalizationRewardCommission[0]}
                max={boundaries.finalizationRewardCommission[1]}
                {...commonSliderProps}
            />
            <Form.Submit className={styles.bakerFlowContinue}>
                Continue
            </Form.Submit>
        </Form>
    );
}

const MetadataUrlPage = ({
    onNext,
    initial = '',
}: AccountTransactionFlowPageProps<MetadataUrl>) => {
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

const GenerateKeysPage = ({
    onNext,
    initial,
}: AccountTransactionFlowPageProps<BakerKeys>) => {
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
    openForDelegation: OpenStatus;
    commissions: Commissions;
    metadataUrl: MetadataUrl;
    keys: BakerKeys;
}

type Props = Dependencies;
type UnsafeProps = MakeRequired<Partial<Props>, 'account'>;
type AddBakerPayload = MakeOptional<
    NotOptional<ConfigureBakerPayload>,
    'metadataUrl'
>;

const hasNecessaryProps = (props: UnsafeProps): props is Props => {
    return [props.exchangeRate, props.nonce, props.blockSummary].every(
        isDefined
    );
};

const withData = (component: ComponentType<Props>) =>
    connect((s: RootState) => ({
        account: chosenAccountSelector(s) as Account,
    }))(
        withNonce(
            withExchangeRate(
                withChainData(
                    ensureProps(
                        component,
                        hasNecessaryProps,
                        <AccountTransactionFlowLoading title={title} />
                    )
                )
            )
        )
    );

export default withData(function AddBaker(props: Props) {
    const { nonce, account, exchangeRate } = props;

    function convertToTransaction({
        stake,
        keys,
        openForDelegation,
        metadataUrl,
        commissions,
    }: AddBakerState): ConfigureBakerTransaction {
        const payload: AddBakerPayload = {
            electionVerifyKey: [keys.electionPublic, keys.proofElection],
            signatureVerifyKey: [keys.signaturePublic, keys.proofSignature],
            aggregationVerifyKey: [
                keys.aggregationPublic,
                keys.proofAggregation,
            ],
            stake: toMicroUnits(stake.stake),
            restakeEarnings: stake.restake,
            openForDelegation,
            metadataUrl,
            ...commissions,
        };

        const transaction = createConfigureBakerTransaction(
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
        <dependencies.Provider value={props}>
            <AccountTransactionFlow<AddBakerState, ConfigureBakerTransaction>
                title={title}
                convert={convertToTransaction}
            >
                {{
                    stake: { component: StakePage },
                    openForDelegation: { component: OpenForDelegationPage },
                    commissions: { component: CommissionsPage },
                    metadataUrl: { component: MetadataUrlPage },
                    keys: { component: GenerateKeysPage },
                }}
            </AccountTransactionFlow>
        </dependencies.Provider>
    );
});
