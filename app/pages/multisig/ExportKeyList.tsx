import { push } from 'connected-react-router';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Header, Menu } from 'semantic-ui-react';
import { foundationTransactionsEnabledSelector } from '../../features/SettingsSlice';
import routes from '../../constants/routes.json';

export enum ExportKeyType {
    Root = 'root',
    Level1 = 'level1',
    Level2 = 'level2',
    Account = 'account',
}

const exportKeyOptionMap = new Map<ExportKeyType, string>([
    [ExportKeyType.Root, 'Governance root key'],
    [ExportKeyType.Level1, 'Governance level 1 key'],
    [ExportKeyType.Level2, 'Governance level 2 key'],
    [ExportKeyType.Account, 'Account key'],
]);

export function getKeyDisplay(keyType: ExportKeyType): string | undefined {
    return exportKeyOptionMap.get(keyType);
}

/**
 * Component that displays a list of multi signature transaction proposals.
 */
export default function ExportKeyList(): JSX.Element {
    const dispatch = useDispatch();

    const foundationTransactionsEnabled: boolean = useSelector(
        foundationTransactionsEnabledSelector
    );

    let keyTypes = Array.from(exportKeyOptionMap);
    if (!foundationTransactionsEnabled) {
        keyTypes = keyTypes.filter(
            ([keyType]) =>
                keyType !== ExportKeyType.Root &&
                keyType !== ExportKeyType.Level1 &&
                keyType !== ExportKeyType.Level2
        );
    }

    return (
        <Menu vertical fluid>
            {keyTypes.map(([keyType, label]) => {
                return (
                    <Menu.Item
                        key={keyType}
                        onClick={() =>
                            dispatch(
                                push(
                                    routes.MULTISIGTRANSACTIONS_EXPORT_KEY.replace(
                                        ':keyType',
                                        keyType
                                    )
                                )
                            )
                        }
                    >
                        <Header>{label}</Header>
                    </Menu.Item>
                );
            })}
        </Menu>
    );
}
