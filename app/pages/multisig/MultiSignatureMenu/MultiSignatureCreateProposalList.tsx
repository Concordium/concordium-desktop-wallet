import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ButtonNavLink from '../../../components/ButtonNavLink';
import { foundationTransactionsEnabledSelector } from '../../../features/SettingsSlice';
import {
    TransactionTypes,
    UpdateType,
    TransactionKindId as TransactionKind,
} from '~/utils/types';

import styles from './MultiSignatureMenu.module.scss';
import { createProposalRoute } from '../../../utils/routerHelper';
import { proposalsSelector } from '~/features/MultiSignatureSlice';
import { expireProposals } from '~/utils/ProposalHelper';

// TODO Show non-foundation transaction types.

// Defines the list of options for creating multi signature transactions.
const multiSigTransactionTypesMap: [TransactionTypes, UpdateType, string][] = [
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

    let availableTransactionTypes: [
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
            'Simple Transfer',
        ],
        [
            TransactionTypes.AccountTransaction,
            TransactionKind.Transfer_with_schedule,
            'Scheduled Transfer',
        ],
    ];
    if (foundationTransactionsEnabled) {
        availableTransactionTypes = availableTransactionTypes.concat(
            multiSigTransactionTypesMap
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
