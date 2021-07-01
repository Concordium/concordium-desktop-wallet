import React from 'react';
import { useSelector } from 'react-redux';
import Columns from '~/components/Columns';
import ConnectionSettingElement from '~/components/ConnectionSettingElement';
import PageLayout from '~/components/PageLayout';
import { settingsSelector } from '~/features/SettingsSlice';
import settingsKeys from '~/constants/settingKeys.json';
import { SettingTypeEnum } from '~/utils/types';
import Button from '~/cross-app-components/Button';

export default function SetNodeConnection() {
    const settings = useSelector(settingsSelector);
    const nodeConnectionSetting = settings
        .find((s) => s.type === settingsKeys.nodeSettings)
        ?.settings.find((s) => s.type === SettingTypeEnum.Connection);

    if (!nodeConnectionSetting) {
        return null;
    }

    return (
        <PageLayout.Container className="pB0" disableBack padding="both">
            <h2>Connect to a node</h2>
            <Columns>
                <Columns.Column>
                    <p>
                        Most of the features in the Concordium Desktop Wallet
                        requires an active connection to a node participating in
                        the Concorrdium blockchain. If you already have your own
                        node running, you can connect to it on the right. Make
                        sure to input the correct IP address and port number.
                    </p>
                    <p>
                        If you do not have a node running yet, you can read more
                        about how to get started on
                        developer.concordium.software.
                    </p>
                    <p>
                        You will later be able to connect to the node via the
                        Settings tab.
                    </p>
                </Columns.Column>
                <Columns.Column>
                    <ConnectionSettingElement
                        displayText="Node Connection"
                        setting={nodeConnectionSetting}
                    />
                </Columns.Column>
            </Columns>
            <Button>Continue</Button>
        </PageLayout.Container>
    );
}
