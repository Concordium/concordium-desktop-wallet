import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import { foundationTransactionsEnabledSelector } from '../../features/SettingsSlice';
import { UpdateType } from '../../utils/types';

// TODO Show non-foundation transaction types.

// Defines the list of options for creating multi signature transactions.
const multiSigTransactionTypesMap: [UpdateType, string][] = [
    [UpdateType.UpdateMicroGTUPerEuro, 'Update µGTU per euro'],
    [UpdateType.UpdateEuroPerEnergy, 'Update Euro per energy'],
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

    let availableTransactionTypes: [UpdateType, string][] = [];
    if (foundationTransactionsEnabled) {
        availableTransactionTypes = availableTransactionTypes.concat(
            multiSigTransactionTypesMap
        );
    }

    return (
        <Menu vertical fluid size="massive">
            {availableTransactionTypes.map((item) => {
                return (
                    <Menu.Item
                        key={item[0]}
                        as={Link}
                        // TODO Must also be able to handle account transaction types.
                        to={{
                            pathname: `/MultiSignatureTransaction/create`,
                            state: item[0],
                        }}
                    >
                        {item[1]}
                    </Menu.Item>
                );
            })}
        </Menu>
    );
}
