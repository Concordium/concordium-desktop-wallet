import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import { foundationTransactionsEnabledSelector } from '../../features/SettingsSlice';
import {
    UpdateType,
    TransactionKindString as TransactionKind,
} from '../../utils/types';
import routes from '../../constants/routes.json';

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
        <Menu vertical fluid size="massive">
            {availableTransactionTypes.map(([transactionType, label]) => {
                let to;
                if (transactionType in UpdateType) {
                    to = {
                        pathname: routes.MULTISIGTRANSACTIONS_PROPOSAL,
                    };
                } else {
                    to = {
                        pathname: routes.UPDATE_ACCOUNT_CREDENTIALS,
                        state: transactionType,
                    };
                }
                return (
                    <Menu.Item
                        key={transactionType}
                        as={Link}
                        // TODO Must also be able to handle account transaction types.
                        to={to}
                    >
                        {label}
                    </Menu.Item>
                );
            })}
        </Menu>
    );
}
