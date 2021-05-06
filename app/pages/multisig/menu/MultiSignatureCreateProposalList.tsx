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

import styles from '../MultiSignaturePage/MultiSignaturePage.module.scss';

// Defines the list of options for creating multi signature transactions.
const updateInstructionTypes: [TransactionTypes, UpdateType, string][] = [
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateMicroGTUPerEuro,
        'Update µGTU per Euro',
    ],
    [
        TransactionTypes.UpdateInstruction,
        UpdateType.UpdateEuroPerEnergy,
        'Update Euro per energy',
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
];

const accountTransactionTypes: [
    TransactionTypes,
    UpdateType | TransactionKind,
    string
][] = [
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Update_credentials,
        'Update Account Credentials',
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Simple_transfer,
        'Send GTU',
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Transfer_with_schedule,
        'Send GTU with a schedule',
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Add_baker,
        'Add Baker',
    ],
    [
        TransactionTypes.AccountTransaction,
        TransactionKind.Remove_baker,
        'Remove Baker',
    ],
];

/**
 * Component that displays a menu containing the available multi signature
 * transaction types. If foundation transactions area enabled in settings,
 * then these are also listed here.
 */
export default function MultiSignatureCreateProposalView() {
    const proposals = useSelector(proposalsSelector);
    const foundationTransactionsEnabled: boolean = useSelector(
        foundationTransactionsEnabledSelector
    );
    const dispatch = useDispatch();

    let availableTransactionTypes = accountTransactionTypes;

    if (foundationTransactionsEnabled) {
        availableTransactionTypes = availableTransactionTypes.concat(
            updateInstructionTypes
        );
    }

    useEffect(() => {
        return expireProposals(proposals, dispatch);
    }, [dispatch, proposals]);

    return (
        <>
            {availableTransactionTypes.map(
                ([transactionType, specificType, label]) => (
                    <ButtonNavLink
                        className={styles.link}
                        key={`${transactionType}${specificType}`}
                        to={createProposalRoute(transactionType, specificType)}
                    >
                        {label}
                    </ButtonNavLink>
                )
            )}
        </>
    );
}
