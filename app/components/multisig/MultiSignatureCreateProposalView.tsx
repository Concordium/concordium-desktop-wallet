import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import { settingsSelector } from '../../features/SettingsSlice';
import { Settings, UpdateType } from '../../utils/types';

export default function MultiSignatureProposalView() {
    const settings: Settings[] = useSelector(settingsSelector);

    // TODO Refactor into a selector function in the slice that allows for selecting general settings.
    const foundationTransactionsEnabled: boolean =
        settings[0].settings.find(
            (obj) => obj.name === 'foundationTransactionsEnabled'
        )?.value === '1';

    let availableTransactionTypes = [];
    if (foundationTransactionsEnabled) {
        const foundationTransactionTypes = Object.keys(
            UpdateType
        ).filter((key) => Number.isNaN(Number(key)));
        availableTransactionTypes = availableTransactionTypes.concat(
            foundationTransactionTypes
        );
    }

    return (
        <Menu vertical fluid size="massive">
            {availableTransactionTypes.map((item) => (
                <Menu.Item
                    key={item}
                    as={Link}
                    // TODO Dynamically set state depending on the transaction type. Must also be able to handle account transaction types.
                    to={{
                        pathname: `/MultiSignatureTransaction/create/${item}`,
                        state: UpdateType.UpdateMicroGTUPerEuro,
                    }}
                >
                    {item}
                </Menu.Item>
            ))}
        </Menu>
    );
}
