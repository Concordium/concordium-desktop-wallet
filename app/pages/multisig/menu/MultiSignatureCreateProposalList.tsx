import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ButtonNavLink from '~/components/ButtonNavLink';
import { foundationTransactionsEnabledSelector } from '~/features/SettingsSlice';
import {
    UpdateType,
    TransactionKindString as TransactionKind,
} from '~/utils/types';
import { createProposalRoute } from '~/utils/routerHelper';
import { proposalsSelector } from '~/features/MultiSignatureSlice';
import { expireProposals } from '~/utils/ProposalHelper';

import styles from '../MultiSignaturePage/MultiSignaturePage.module.scss';

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
    [UpdateType.UpdateBakerStakeThreshold, 'Update baker stake threshold'],
    [UpdateType.UpdateElectionDifficulty, 'Update election difficulty'],
    [UpdateType.UpdateRootKeys, 'Update root keys'],
    [
        UpdateType.UpdateLevel1KeysUsingRootKeys,
        'Update level 1 keys using root keys',
    ],
    [
        UpdateType.UpdateLevel1KeysUsingLevel1Keys,
        'Update level 1 keys using level 1 keys',
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

    let availableTransactionTypes: [UpdateType | TransactionKind, string][] = [
        [TransactionKind.UpdateCredentials, 'Update Account Credentials'],
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
