import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSettingEntry } from '~/features/SettingsSlice';
import { loadGlobal, globalSelector } from '~/features/GlobalSlice';
import { Setting } from '~/utils/types';
import { getConsensusStatus } from '~/utils/nodeRequests';
import startClient from '~/utils/nodeConnector';
import Card from '~/cross-app-components/Card';
import Form from '~/components/Form';
import styles from './ConnectionSettingElement.module.scss';
import ConnectionStatusComponent, {
    Status,
} from '~/components/ConnectionStatusComponent';

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
    const global = useSelector(globalSelector);
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
            const consensusStatus = await getConsensusStatus();
            if (!global) {
                const blockHash = consensusStatus.lastFinalizedBlock;
                await loadGlobal(dispatch, blockHash);
            }
            setConnected(true);
        } catch (e) {
            setConnected(false);
        }
        setHasBeenTested(true);
        setTestingConnection(false);
    }

    let status = Status.Pending;
    if (!connected && hasBeenTested && !testingConnection) {
        status = Status.Failed;
    } else if (testingConnection) {
        status = Status.Loading;
    } else if (!testingConnection && connected) {
        status = Status.Successful;
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
                    placeholder="Insert node IP address here"
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
                    placeholder="Insert port here"
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
                <div className={styles.status}>
                    <ConnectionStatusComponent status={status} />
                </div>
                <Form.Submit className={styles.submit}>
                    Test connection
                </Form.Submit>
            </Form>
        </Card>
    );
}
