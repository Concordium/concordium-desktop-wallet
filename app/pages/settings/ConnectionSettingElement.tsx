import React, { useState } from 'react';
import { ipcRenderer } from 'electron';
import { useDispatch, useSelector } from 'react-redux';
import { updateSettingEntry } from '~/features/SettingsSlice';
import { loadGlobal, globalSelector } from '~/features/GlobalSlice';
import { Setting } from '~/utils/types';
import { getConsensusStatus } from '~/node/nodeRequests';
import startClient from '~/node/nodeConnector';
import Card from '~/cross-app-components/Card';
import Form from '~/components/Form';
import styles from './ConnectionSettingElement.module.scss';
import ConnectionStatusComponent, {
    Status,
} from '~/components/ConnectionStatusComponent';
import ipcCommands from '../../constants/ipcCommands.json';
import { JsonResponse } from '~/proto/concordium_p2p_rpc_pb';
import { ConsensusStatus } from '~/node/NodeApiTypes';
import { getGenesis, setGenesis } from '~/database/GenesisDao';

interface Props {
    displayText: string;
    setting: Setting;
}

const portRangeMax = 65535;

/**
 * A component for connection settings that are updated automatically on changes.
 * N.B. right now is fixed to node location setting.
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
    const [failedMessage, setFailedMessage] = useState<string>();

    async function updateValues(newAddress: string, newPort: string) {
        startClient(dispatch, newAddress, newPort);
        updateSettingEntry(dispatch, {
            ...setting,
            value: JSON.stringify({
                address: newAddress,
                port: newPort,
            }),
        });
    }

    async function setConnection() {
        setTestingConnection(true);
        try {
            const genesis = await getGenesis();
            if (genesis) {
                const result = await ipcRenderer.invoke(
                    ipcCommands.grpcNodeConsensusStatus,
                    address,
                    port
                );
                if (result.successful) {
                    const consensusStatus: ConsensusStatus = JSON.parse(
                        JsonResponse.deserializeBinary(
                            result.response
                        ).getValue()
                    );
                    if (consensusStatus.genesisBlock !== genesis.genesisBlock) {
                        setFailedMessage(
                            'Connecting to a node running on a separate blockchain is not allowed'
                        );
                        setConnected(false);
                        setHasBeenTested(true);
                        setTestingConnection(false);
                        return;
                    }
                } else {
                    setConnected(false);
                    setHasBeenTested(true);
                    setTestingConnection(false);
                    return;
                }
            }

            await updateValues(address, port);
            const consensusStatus = await getConsensusStatus();
            if (!global) {
                const blockHash = consensusStatus.lastFinalizedBlock;
                await loadGlobal(dispatch, blockHash);
            }
            if (!genesis) {
                await setGenesis(consensusStatus.genesisBlock);
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
                        setConnection();
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
                    }}
                    rules={{
                        min: 1,
                        max: portRangeMax,
                    }}
                />
                <div className={styles.status}>
                    <ConnectionStatusComponent
                        status={status}
                        failedMessage={failedMessage}
                    />
                </div>
                <Form.Submit className={styles.submit}>
                    Set connection
                </Form.Submit>
            </Form>
        </Card>
    );
}
