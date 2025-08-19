import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ButtonNavLink from '~/components/ButtonNavLink';
import { foundationTransactionsEnabledSelector } from '~/features/SettingsSlice';
import {
    TransactionTypes,
    UpdateType,
    TransactionKindId as TransactionKind,
} from '~/utils/types';
import { createProposalRoute } from '~/utils/routerHelper';
import { proposalsSelector } from '~/features/MultiSignatureSlice';
import { expireProposals } from '~/utils/ProposalHelper';
import routes from '~/constants/routes.json';
import { useProtocolVersion } from '~/utils/dataHooks';
import {
    hasDelegationProtocol,
    hasConsensusUpdateProtocol,
} from '~/utils/protocolVersion';
import { not } from '~/utils/functionHelpers';

import styles from '../MultiSignaturePage/MultiSignaturePage.module.scss';

type SpecificType = UpdateType | TransactionKind;
type TypeTuple = [
    TransactionTypes,
    SpecificType,
    string,
    ((pv: bigint) => boolean)?
];

// Defines the list of options for creating multi signature transactions.
const updateInstructionTypes: TypeTuple[] = [
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateMicroGTUPerEuro,
        'Update µCCD per euro',
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateEuroPerEnergy,
        'Update euro per energy',
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateTransactionFeeDistribution,
        'Update transaction fee distribution',
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateFoundationAccount,
        'Update foundation account address',
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateMintDistribution,
        'Update mint distribution',
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateProtocol,
        'Update protocol',
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateGASRewards,
        'Update GAS rewards',
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateElectionDifficulty,
        'Update election difficulty',
        not(hasConsensusUpdateProtocol),
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateBakerStakeThreshold,
        'Update validator stake threshold',
        not(hasDelegationProtocol),
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateRootKeys,
        'Update root keys',
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateLevel1KeysUsingRootKeys,
        'Update level 1 keys using root keys',
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateLevel1KeysUsingLevel1Keys,
        'Update level 1 keys using level 1 keys',
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateLevel2KeysUsingRootKeys,
        'Update level 2 keys using root keys',
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateLevel2KeysUsingLevel1Keys,
        'Update level 2 keys using level 1 keys',
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.AddIdentityProvider,
        'Add identity provider',
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.AddAnonymityRevoker,
        'Add identity disclosure authority',
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.CooldownParameters,
        'Update cooldown parameters',
        hasDelegationProtocol,
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.PoolParameters,
        'Update pool parameters',
        hasDelegationProtocol,
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.TimeParameters,
        'Update time parameters',
        hasDelegationProtocol,
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.BlockEnergyLimit,
        'Update block energy limit',
        hasConsensusUpdateProtocol,
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.FinalizationCommitteeParameters,
        'Update finalization committee parameters',
        hasConsensusUpdateProtocol,
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.MinBlockTime,
        'Update minimum block time',
        hasConsensusUpdateProtocol,
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.TimeoutParameters,
        'Update timeout parameters',
        hasConsensusUpdateProtocol,
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateValidatorScoreParameters,
        'Update validator score parameters',
        (pv) => pv >= 8n,
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateCreatePltParameters,
        'Create PLT (protocol level token)',
        (pv) => pv >= 9n,
    ],
];

/**
 * [Transaction type, Transaction kind, Button label, Protocol version filter]
 */
const accountTransactionTypes: TypeTuple[] = [
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Update_credentials,
        'Update account credentials',
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Simple_transfer,
        'Send CCD',
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Transfer_with_schedule,
        'Send CCD with a schedule',
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Register_data,
        'Register data',
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Add_baker,
        'Add validator',
        not(hasDelegationProtocol),
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Update_baker_keys,
        'Update validator keys',
        not(hasDelegationProtocol),
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Remove_baker,
        'Remove validator',
        not(hasDelegationProtocol),
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Update_baker_stake,
        'Update validator stake',
        not(hasDelegationProtocol),
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Update_baker_restake_earnings,
        'Update validator restake earnings',
        not(hasDelegationProtocol),
    ],
];

const configureBakerLinks = (pv: bigint) => (
    <>
        <ButtonNavLink
            className={styles.link}
            to={routes.MULTISIGTRANSACTIONS_ADD_BAKER}
        >
            Register as a validator
        </ButtonNavLink>
        <ButtonNavLink
            className={styles.link}
            to={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_STAKE}
        >
            Update validator stake
        </ButtonNavLink>
        <ButtonNavLink
            className={styles.link}
            to={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_POOL}
        >
            Update staking pool
        </ButtonNavLink>
        <ButtonNavLink
            className={styles.link}
            to={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_KEYS}
        >
            Update validator keys
        </ButtonNavLink>
        {pv >= 8n && (
            <ButtonNavLink
                className={styles.link}
                to={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_SUSPENSION}
            >
                Update validator suspension
            </ButtonNavLink>
        )}
        <ButtonNavLink
            className={styles.link}
            to={routes.MULTISIGTRANSACTIONS_REMOVE_BAKER}
        >
            Stop validation
        </ButtonNavLink>
    </>
);

const configureDelegationLinks = (
    <>
        <ButtonNavLink
            className={styles.link}
            to={routes.MULTISIGTRANSACTIONS_ADD_DELEGATION}
        >
            Register as a delegator
        </ButtonNavLink>
        <ButtonNavLink
            className={styles.link}
            to={routes.MULTISIGTRANSACTIONS_UPDATE_DELEGATION}
        >
            Update delegation
        </ButtonNavLink>
        <ButtonNavLink
            className={styles.link}
            to={routes.MULTISIGTRANSACTIONS_REMOVE_DELEGATION}
        >
            Remove delegation
        </ButtonNavLink>
    </>
);

// eslint-disable-next-line react/display-name
const toLink = (pv: bigint | undefined) => ([
    transactionType,
    specificType,
    label,
    filter = () => true,
]: TypeTuple) =>
    pv !== undefined &&
    filter(pv) && (
        <ButtonNavLink
            key={`${transactionType}${specificType}`}
            className={styles.link}
            to={createProposalRoute(transactionType, specificType)}
        >
            {label}
        </ButtonNavLink>
    );

/**
 * Component that displays a menu containing the available multi signature
 * transaction types. Does not display governance proposal types.
 */
export function MultiSignatureCreateAccountProposalView() {
    const proposals = useSelector(proposalsSelector);
    const pv = useProtocolVersion(true);
    const dispatch = useDispatch();

    useEffect(() => {
        return expireProposals(proposals, dispatch);
    }, [dispatch, proposals]);

    return (
        <>
            {accountTransactionTypes.map(toLink(pv))}
            {pv !== undefined && hasDelegationProtocol(pv) && (
                <>
                    {configureBakerLinks(pv)}
                    {configureDelegationLinks}
                </>
            )}
        </>
    );
}

/**
 * Component that displays a menu containing the available governance
 * transaction types.
 */
export function MultiSignatureCreateGovernanceProposalView() {
    const proposals = useSelector(proposalsSelector);
    const pv = useProtocolVersion(true);
    const foundationTransactionsEnabled: boolean = useSelector(
        foundationTransactionsEnabledSelector
    );
    const dispatch = useDispatch();

    useEffect(() => {
        return expireProposals(proposals, dispatch);
    }, [dispatch, proposals]);

    return (
        <>
            {foundationTransactionsEnabled &&
                updateInstructionTypes.map(toLink(pv))}
        </>
    );
}

/**
 * Component that displays a menu containing the available multi signature
 * transaction types. If foundation transactions area enabled in settings,
 * then these are also listed here.
 */
export default function MultiSignatureCreateProposalView() {
    const proposals = useSelector(proposalsSelector);
    const pv = useProtocolVersion(true);
    const foundationTransactionsEnabled: boolean = useSelector(
        foundationTransactionsEnabledSelector
    );
    const dispatch = useDispatch();

    useEffect(() => {
        return expireProposals(proposals, dispatch);
    }, [dispatch, proposals]);

    return (
        <>
            {accountTransactionTypes.map(toLink(pv))}
            {pv !== undefined && hasDelegationProtocol(pv) && (
                <>
                    {configureBakerLinks(pv)}
                    {configureDelegationLinks}
                </>
            )}
            {foundationTransactionsEnabled &&
                updateInstructionTypes.map(toLink(pv))}
        </>
    );
}
