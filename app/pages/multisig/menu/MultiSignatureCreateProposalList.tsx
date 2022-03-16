import React, { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ButtonNavLink from '~/components/ButtonNavLink';
import { foundationTransactionsEnabledSelector } from '~/features/SettingsSlice';
import {
    TransactionTypes,
    UpdateType,
    TransactionKindId as TransactionKind,
    TransactionKindId,
} from '~/utils/types';
import { createProposalRoute } from '~/utils/routerHelper';
import { proposalsSelector } from '~/features/MultiSignatureSlice';
import { expireProposals } from '~/utils/ProposalHelper';
import routes from '~/constants/routes.json';
import { useProtocolVersion } from '~/utils/dataHooks';
import { hasDelegationProtocol } from '~/utils/protocolVersion';
import { not } from '~/utils/basicHelpers';

import styles from '../MultiSignaturePage/MultiSignaturePage.module.scss';

// Defines the list of options for creating multi signature transactions.
const updateInstructionTypes: [TransactionTypes, UpdateType, string][] = [
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
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateBakerStakeThreshold,
        'Update baker stake threshold',
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
        'Add anonymity revoker',
    ],
];

/**
 * [Transaction type, Transaction kind, Button label, Protocol version filter]
 */
const accountTransactionTypes: [
    TransactionTypes,
    TransactionKind,
    string,
    ((pv: bigint) => boolean) | undefined
][] = [
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Update_credentials,
        'Update account credentials',
        undefined,
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Simple_transfer,
        'Send CCD',
        undefined,
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Transfer_with_schedule,
        'Send CCD with a schedule',
        undefined,
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Add_baker,
        'Add baker',
        not(hasDelegationProtocol),
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Update_baker_keys,
        'Update baker keys',
        not(hasDelegationProtocol),
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Remove_baker,
        'Remove baker',
        not(hasDelegationProtocol),
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Update_baker_stake,
        'Update baker stake',
        not(hasDelegationProtocol),
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Update_baker_restake_earnings,
        'Update baker restake earnings',
        not(hasDelegationProtocol),
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Configure_baker,
        'Configure baker',
        hasDelegationProtocol,
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Configure_delegation,
        'Configure delegation',
        hasDelegationProtocol,
    ],
];

const configureBakerLinks = (
    <>
        <ButtonNavLink
            className={styles.link}
            to={routes.MULTISIGTRANSACTIONS_ADD_BAKER}
        >
            Add baker
        </ButtonNavLink>
        <ButtonNavLink
            className={styles.link}
            to={routes.MULTISIGTRANSACTIONS_REMOVE_BAKER}
        >
            Remove baker
        </ButtonNavLink>
        <ButtonNavLink
            className={styles.link}
            to={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_STAKE}
        >
            Update baker stake
        </ButtonNavLink>
        <ButtonNavLink
            className={styles.link}
            to={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_POOL}
        >
            Update baker pool
        </ButtonNavLink>
        <ButtonNavLink
            className={styles.link}
            to={routes.MULTISIGTRANSACTIONS_UPDATE_BAKER_KEYS}
        >
            Update baker keys
        </ButtonNavLink>
    </>
);

const configureDelegationLinks = (
    <>
        <ButtonNavLink
            className={styles.link}
            to={routes.MULTISIGTRANSACTIONS_CONFIGURE_DELEGATION}
        >
            Configure delegation
        </ButtonNavLink>
        <ButtonNavLink
            className={styles.link}
            to={routes.MULTISIGTRANSACTIONS_REMOVE_DELEGATION}
        >
            Remove delegation
        </ButtonNavLink>
    </>
);

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

    const availableTransactionTypes = foundationTransactionsEnabled
        ? [...accountTransactionTypes, ...updateInstructionTypes]
        : accountTransactionTypes;

    useEffect(() => {
        return expireProposals(proposals, dispatch);
    }, [dispatch, proposals]);

    return (
        <>
            {availableTransactionTypes.map(
                ([transactionType, specificType, label, filter = () => true]) =>
                    pv !== undefined &&
                    filter(pv) && (
                        <Fragment key={`${transactionType}${specificType}`}>
                            {[
                                TransactionKindId.Configure_baker,
                                TransactionKindId.Configure_delegation,
                            ].every((k) => k !== specificType) && (
                                <ButtonNavLink
                                    className={styles.link}
                                    to={createProposalRoute(
                                        transactionType,
                                        specificType
                                    )}
                                >
                                    {label}
                                </ButtonNavLink>
                            )}
                            {specificType ===
                                TransactionKindId.Configure_baker &&
                                configureBakerLinks}
                            {specificType ===
                                TransactionKindId.Configure_delegation &&
                                configureDelegationLinks}
                        </Fragment>
                    )
            )}
        </>
    );
}
