import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Header, Menu } from 'semantic-ui-react';
import { selectSettings, settingsSelector } from '../../features/SettingsSlice';

export default function SettingsList() {
    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);

    return (
        <Menu vertical size={'massive'}>
             {settings.map((setting, i) => (
                 <Menu.Item
                    name={setting.type}
                    onClick={() => selectSettings(dispatch, i)}
                 >
                     <Header>{setting.type}</Header>
                 </Menu.Item>
             ))}
        </Menu>
    );
}
