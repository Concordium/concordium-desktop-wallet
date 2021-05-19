import React from 'react';
import { useSelector } from 'react-redux';
import { settingsSelector } from '../../features/SettingsSlice';
import settingKeys from '../../constants/settingKeys.json';
import ButtonNavLink from '~/components/ButtonNavLink';
import { selectedSettingRoute } from '~/utils/routerHelper';
import styles from './SettingsList.module.scss';

const settingsName = new Map<string, string>([
    [settingKeys.multiSignatureSettings, 'Multi signature settings'],
    [settingKeys.nodeSettings, 'Node settings'],
    [settingKeys.passwordSettings, 'Change wallet password'],
]);

export default function SettingsList() {
    const settings = useSelector(settingsSelector);

    return (
        <>
            {settings.map((setting) => (
                <ButtonNavLink
                    className={styles.item}
                    key={setting.type}
                    to={selectedSettingRoute(setting.type)}
                >
                    {settingsName.get(setting.type)}
                </ButtonNavLink>
            ))}
        </>
    );
}
