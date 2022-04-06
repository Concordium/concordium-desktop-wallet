import {
    AccountBakerDetails,
    AccountBakerDetailsV1,
    AccountDelegationDetails,
} from '@concordium/node-sdk';
import { isReduceStakePendingChange } from '@concordium/node-sdk/lib/src/accountHelpers';
import React, { PropsWithChildren } from 'react';
import RegisteredIcon from '@resources/svg/logo-checkmark.svg';
import Label from '~/components/Label';
import Card from '~/cross-app-components/Card';
import { displayAsCcd } from '~/utils/ccd';
import { useLastFinalizedBlockSummary } from '~/utils/dataHooks';
import { toFixed } from '~/utils/numberStringHelpers';
import { hasDelegationProtocol } from '~/utils/protocolVersion';
import {
    dateFromStakePendingChange,
    getFormattedDateString,
} from '~/utils/timeHelpers';
import {
    displayPoolOpen,
    displayRestakeEarnings,
} from '~/utils/transactionFlows/configureBaker';
import {
    displayDelegationTarget,
    displayRedelegate,
} from '~/utils/transactionFlows/configureDelegation';
import { useAsyncMemo } from '~/utils/hooks';
import { noOp } from '~/utils/basicHelpers';
import { getRewardStatus } from '~/node/nodeRequests';

import styles from './StakingDetails.module.scss';

interface ValueProps {
    title: string;
    value: string;
}

function Value({ title, value }: ValueProps) {
    return (
        <div className="mB10:notLast">
            <Label className="mB5 textWhite">{title}</Label>
            <span className="body2 mono">{value}</span>
        </div>
    );
}

interface ValuesProps<T> {
    details: T;
}

const formatCommission = (value: number) =>
    `${toFixed(3)((value * 100).toString())}%`;

interface BakerValuesProps extends ValuesProps<AccountBakerDetails> {
    isDelegationProtocol: boolean;
}

function BakerValues({ details, isDelegationProtocol }: BakerValuesProps) {
    return (
        <>
            <Value
                title="Baker stake"
                value={displayAsCcd(details.stakedAmount)}
            />
            <Value title="Baker ID" value={details.bakerId.toString()} />
            <Value
                title="Restake earnings"
                value={displayRestakeEarnings(details.restakeEarnings)}
            />
            {isDelegationProtocol && (
                <>
                    <Value
                        title="Delegation pool status"
                        value={displayPoolOpen(
                            (details as AccountBakerDetailsV1).bakerPoolInfo
                                .openStatus
                        )}
                    />
                    <Value
                        title="Transaction fee commission"
                        value={formatCommission(
                            (details as AccountBakerDetailsV1).bakerPoolInfo
                                .commissionRates.transactionCommission
                        )}
                    />
                    <Value
                        title="Baking reward commission"
                        value={formatCommission(
                            (details as AccountBakerDetailsV1).bakerPoolInfo
                                .commissionRates.bakingCommission
                        )}
                    />
                    <Value
                        title="Finalization reward commission"
                        value={formatCommission(
                            (details as AccountBakerDetailsV1).bakerPoolInfo
                                .commissionRates.finalizationCommission
                        )}
                    />
                </>
            )}
        </>
    );
}

function DelegatorValues({ details }: ValuesProps<AccountDelegationDetails>) {
    return (
        <>
            <Value
                title="Delegation amount"
                value={displayAsCcd(details.stakedAmount)}
            />
            <Value
                title="Target pool"
                value={displayDelegationTarget(details.delegationTarget)}
            />
            <Value
                title="Redelegate earnings"
                value={displayRedelegate(details.restakeEarnings)}
            />
        </>
    );
}

interface DetailsText {
    title: string;
    pendingReduce: string;
    pendingRemove: string;
}

const bakerText: DetailsText = {
    title: 'Baker registered',
    pendingReduce: 'New baker stake',
    pendingRemove:
        'Baking will be stopped, and the staked amount will be unlocked on the public balance of the account.',
};

const delegatorText: DetailsText = {
    title: 'Delegation registered',
    pendingReduce: 'New delegation amount',
    pendingRemove:
        'The delegation will be stopped, and the delegation amount will be unlocked on the public balance of the account.',
};

type StakingDetails = AccountBakerDetails | AccountDelegationDetails;

const isBakerDetails = (
    details: StakingDetails
): details is AccountBakerDetails =>
    (details as AccountBakerDetails).bakerId !== undefined;
const isDelegationDetails = (
    details: StakingDetails
): details is AccountDelegationDetails =>
    (details as AccountDelegationDetails).delegationTarget !== undefined;

type Props = PropsWithChildren<{
    details: StakingDetails;
}>;

export default function StakingDetails({ details }: Props) {
    const { consensusStatus: cs, lastFinalizedBlockSummary: bs } =
        useLastFinalizedBlockSummary() ?? {};
    const rs = useAsyncMemo(
        async () =>
            cs !== undefined
                ? getRewardStatus(cs.lastFinalizedBlock)
                : undefined,
        noOp,
        [cs]
    );
    const text = isBakerDetails(details) ? bakerText : delegatorText;

    const pendingChangeDate =
        details.pendingChange !== undefined
            ? dateFromStakePendingChange(
                  details.pendingChange,
                  cs,
                  rs,
                  bs?.updates.chainParameters
              )
            : undefined;

    return (
        <Card className={styles.root} dark>
            <header className={styles.header}>
                <RegisteredIcon width={30} />
                <h2 className="mV0 mL10">{text.title}</h2>
            </header>
            <section className="flexColumn justifyCenter mB20">
                {isBakerDetails(details) && (
                    <BakerValues
                        isDelegationProtocol={hasDelegationProtocol(
                            cs?.protocolVersion ?? 1n
                        )}
                        details={details}
                    />
                )}
                {isDelegationDetails(details) && (
                    <DelegatorValues details={details} />
                )}
            </section>
            {details.pendingChange !== undefined &&
                pendingChangeDate !== undefined && (
                    <div className={styles.pending}>
                        <div className="textWhite mB20">
                            The following changes will take effect on
                            <br />
                            {getFormattedDateString(pendingChangeDate)}
                        </div>
                        {isReduceStakePendingChange(details.pendingChange) ? (
                            <Value
                                title={text.pendingReduce}
                                value={displayAsCcd(
                                    details.pendingChange.newStake
                                )}
                            />
                        ) : (
                            <span className="mB20">{text.pendingRemove}</span>
                        )}
                    </div>
                )}
        </Card>
    );
}
