import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import Columns from '~/components/Columns';
import ConnectionSettingElement from '~/components/ConnectionSettingElement';
import PageLayout from '~/components/PageLayout';
import { settingsSelector } from '~/features/SettingsSlice';
import settingsKeys from '~/constants/settingKeys.json';
import routes from '~/constants/routes.json';
import { SettingTypeEnum } from '~/utils/types';
import Button from '~/cross-app-components/Button';
import ExternalLink from '~/components/ExternalLink';

import styles from './SetNodeConnection.module.scss';

export default function SetNodeConnection() {
    const settings = useSelector(settingsSelector);
    const dispatch = useDispatch();
    const nodeConnectionSetting = settings
        .find((s) => s.type === settingsKeys.nodeSettings)
        ?.settings.find((s) => s.type === SettingTypeEnum.Connection);

    if (!nodeConnectionSetting) {
        return null;
    }

    function goToAccounts() {
        dispatch(push(routes.ACCOUNTS));
    }

    return (
        <PageLayout.Container className="pB0" disableBack padding="both">
            <div className="flexColumn minHeight100">
                <h2>Connect to a node</h2>
                <Columns className="mT50 flexChildFill">
                    <Columns.Column className="textLeft">
                        <p className="mT0">
                            Most of the features in the Concordium Desktop
                            Wallet require an active connection to a node
                            participating in the Concordium blockchain. You can
                            either connect to a publically available node, like
                            the node provided on the right, or if you have your
                            own node running you can connect to that instead.
                            Make sure to input the correct IP address and port
                            number.
                        </p>
                        <p>
                            If you do not have a node running yet, you can read
                            more about how to get started on{' '}
                            <ExternalLink href="https://developer.concordium.software">
                                developer.concordium.software
                            </ExternalLink>
                            .
                        </p>
                        <p>
                            You will later be able to connect to the node via
                            the Settings tab.
                        </p>
                    </Columns.Column>
                    <Columns.Column>
                        <div className={styles.connectionSetting}>
                            <ConnectionSettingElement
                                displayText="Node Connection"
                                setting={nodeConnectionSetting}
                            />
                        </div>
                    </Columns.Column>
                </Columns>
                <Button className={styles.button} onClick={goToAccounts}>
                    Continue
                </Button>
            </div>
        </PageLayout.Container>
    );
}
