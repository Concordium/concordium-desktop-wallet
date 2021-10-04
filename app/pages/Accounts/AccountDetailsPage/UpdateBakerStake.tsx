import React from 'react';
import { useSelector } from 'react-redux';
import Form from '~/components/Form';
import Label from '~/components/Label';
import PickBakerStakeAmount from '~/components/PickBakerStakeAmount';
import {
    ensureExchangeRate,
    ExchangeRate,
} from '~/components/Transfers/withExchangeRate';
import Card from '~/cross-app-components/Card';
import Loading from '~/cross-app-components/Loading';
import {
    chosenAccountInfoSelector,
    chosenAccountSelector,
} from '~/features/AccountSlice';
import {
    ChainData,
    ensureChainData,
} from '~/pages/multisig/common/withChainData';
import { noOp } from '~/utils/basicHelpers';
import { useTransactionCostEstimate } from '~/utils/dataHooks';
import { getGTUSymbol } from '~/utils/gtu';
import { EqualRecord, NotOptional, TransactionKindId } from '~/utils/types';

import styles from './AccountDetailsPage.module.scss';

const LoadingComponent = () => <Loading inline />;

interface FormModel {
    stake: string;
}

const fieldNames: EqualRecord<FormModel> = {
    stake: 'stake',
};

type Props = NotOptional<ChainData> & NotOptional<ExchangeRate>;

const UpdateBakerStakeForm = ensureChainData(
    ensureExchangeRate(({ blockSummary, exchangeRate }: Props) => {
        const account = useSelector(chosenAccountSelector);

        if (!account) {
            throw new Error('No account selected');
        }

        const accountInfo = useSelector(chosenAccountInfoSelector);
        const minimumStake = BigInt(
            blockSummary.updates.chainParameters.minimumThresholdForBaking
        );
        const estimatedFee = useTransactionCostEstimate(
            TransactionKindId.Update_baker_stake,
            exchangeRate,
            account.signatureThreshold
        );

        if (!accountInfo) {
            return <LoadingComponent />;
        }

        return (
            <Form<FormModel> onSubmit={noOp}>
                <p className="mT30">
                    Enter your new desired amount to stake. If you raise the
                    stake it will take effect (WHEN IS IT? IMMEDIATELY OR TWO
                    EPOCHS?), and if you lower the stake it will take effect
                    after the grace period.
                </p>
                <Label>Current stake:</Label>
                {getGTUSymbol()} {account}
                <PickBakerStakeAmount
                    fieldName={fieldNames.stake}
                    minimumStake={minimumStake}
                    estimatedFee={estimatedFee}
                />
                <Form.Submit className={styles.bakerFlowContinue}>
                    Continue
                </Form.Submit>
            </Form>
        );
    }, LoadingComponent),
    LoadingComponent
);

export default function UpdateBakerStake() {
    return (
        <Card className="textCenter">
            <h3 className="bodyEmphasized">Update baker stake</h3>
            <UpdateBakerStakeForm />
        </Card>
    );
}
