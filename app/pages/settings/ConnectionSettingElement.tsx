import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import ErrorIcon from '@resources/svg/logo-error.svg';
import { updateSettingEntry } from '../../features/SettingsSlice';
import { Setting } from '../../utils/types';
import { getNodeInfo } from '../../utils/nodeRequests';
import startClient from '../../utils/nodeConnector';
import Card from '~/cross-app-components/Card';
import Form from '~/components/Form';
import styles from './ConnectionSettingElement.module.scss';
import Loading from '~/cross-app-components/Loading';

interface Props {
    displayText: string;
    setting: Setting;
}

const portRangeMax = 65535;

/**
 * A component for connection settings that are updated automatically on changes.
 *  N.B. right now is fixed to node location setting.
 */
export default function ConnectionSetting({ displayText, setting }: Props) {
    const dispatch = useDispatch();
    const startValues = JSON.parse(setting.value);
    const [address, setAddress] = useState(startValues.address);
    const [port, setPort] = useState(startValues.port);
    const [connected, setConnected] = useState<boolean>();
    const [hasBeenTested, setHasBeenTested] = useState<boolean>(false);
    const [testingConnection, setTestingConnection] = useState<boolean>(false);

    // Ideally this should have a debounce, so that we wait a little before actually
    // storing to the database. As we are uncertain if there will be a submit button
    // or not, we will keep it as is for now.
    function updateValues(newAddress: string, newPort: string) {
        startClient(dispatch, newAddress, newPort); // TODO: generalize
        updateSettingEntry(dispatch, {
            ...setting,
            value: JSON.stringify({
                address: newAddress,
                port: newPort,
            }),
        });
    }

    async function testConnection() {
        setTestingConnection(true);
        try {
            await getNodeInfo();
            setConnected(true);
        } catch (e) {
            setConnected(false);
        }
        setHasBeenTested(true);
        setTestingConnection(false);
    }

    let errorComponent;
    if (!connected && hasBeenTested && !testingConnection) {
        errorComponent = (
            <div>
                <ErrorIcon className={styles.icon} />
                <div className={styles.error}>Connection failed</div>
            </div>
        );
    }

    return (
        <Card className={styles.connection}>
            <h3>{displayText}</h3>
            <Form
                onSubmit={() => {
                    if (!testingConnection) {
                        testConnection();
                    }
                }}
            >
                <Form.Input
                    className={styles.input}
                    name="address"
                    label="Address"
                    defaultValue={address}
                    onChange={(event) => {
                        const newAddress = event.target.value;
                        setAddress(newAddress);
                        updateValues(newAddress, port);
                    }}
                />
                <Form.Input
                    className={styles.input}
                    name="port"
                    label="Port"
                    defaultValue={port}
                    onChange={(event) => {
                        const newPort = event.target.value;
                        setPort(newPort);
                        updateValues(address, newPort);
                    }}
                    rules={{
                        min: 1,
                        max: portRangeMax,
                    }}
                />
                {testingConnection && (
                    <Loading inline text="Connecting to node" />
                )}
                {errorComponent}
                {!testingConnection && connected && (
                    <h3>Successfully connected</h3>
                )}
                <Form.Submit className={styles.submit}>
                    Test connection
                </Form.Submit>
            </Form>
        </Card>
    );
}
