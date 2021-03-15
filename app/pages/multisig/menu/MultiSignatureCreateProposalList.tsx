import React from 'react';
import { useSelector } from 'react-redux';
import {
    UpdateType,
    TransactionKindString as TransactionKind,
} from '~/utils/types';
import ButtonNavLink from '~/components/ButtonNavLink';
import { foundationTransactionsEnabledSelector } from '~/features/SettingsSlice';

import styles from './MultiSignatureMenu.module.scss';
import { createProposalRoute } from '~/utils/routerHelper';

// TODO Show non-foundation transaction types.

// Defines the list of options for creating multi signature transactions.
const multiSigTransactionTypesMap: [UpdateType, string][] = [
    [UpdateType.UpdateMicroGTUPerEuro, 'Update µGTU per Euro'],
    [UpdateType.UpdateEuroPerEnergy, 'Update Euro per energy'],
    [
        UpdateType.UpdateTransactionFeeDistribution,
        'Update transaction fee distribution',
    ],
    [UpdateType.UpdateFoundationAccount, 'Update foundation account address'],
    [UpdateType.UpdateMintDistribution, 'Update mint distribution'],
    [UpdateType.UpdateProtocol, 'Update protocol'],
    [UpdateType.UpdateGASRewards, 'Update GAS rewards'],
];

/**
 * Component that displays a menu containing the available multi signature
 * transaction types. If foundation transactions area enabled in settings,
 * then these are also listed here.
 */
export default function MultiSignatureCreateProposalView() {
    const foundationTransactionsEnabled: boolean = useSelector(
        foundationTransactionsEnabledSelector
    );

    let availableTransactionTypes: [UpdateType | TransactionKind, string][] = [
        [TransactionKind.UpdateCredentials, 'Update Account Credentials'],
    ];
    if (foundationTransactionsEnabled) {
        availableTransactionTypes = availableTransactionTypes.concat(
            multiSigTransactionTypesMap
        );
    }

    return (
        <>
            {availableTransactionTypes.map(([transactionType, label]) => (
                <ButtonNavLink
                    className={styles.link}
                    key={transactionType}
                    to={createProposalRoute(transactionType)}
                >
                    {label}
                </ButtonNavLink>
            ))}
        </>
    );
}
