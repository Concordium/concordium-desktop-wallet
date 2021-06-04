import React, { useState } from 'react';
import { ipcRenderer } from 'electron';
import { useDispatch, useSelector } from 'react-redux';
import { updateSettingEntry } from '~/features/SettingsSlice';
import { globalSelector } from '~/features/GlobalSlice';
import { Global, Setting, Versioned } from '~/utils/types';
import startClient from '~/node/nodeConnector';
import Card from '~/cross-app-components/Card';
import Form from '~/components/Form';
import ConnectionStatusComponent, {
    Status,
} from '~/components/ConnectionStatusComponent';
import ipcCommands from '~/constants/ipcCommands.json';
import { JsonResponse } from '~/proto/concordium_p2p_rpc_pb';
import { ConsensusStatus } from '~/node/NodeApiTypes';
import { getGenesis } from '~/database/GenesisDao';
import setGenesisAndGlobal from '~/database/DatabaseHelpers';

import styles from './ConnectionSettingElement.module.scss';

interface Props {
    displayText: string;
    setting: Setting;
}

const portRangeMax = 65535;

/**
 * Retrieves the consesus status and global cryptographic parameters from the
 * node with the given address and port.
 */
async function getConsensusAndGlobalFromNode(address: string, port: string) {
    const result = await ipcRenderer.invoke(
        ipcCommands.grpcNodeConsensusAndGlobal,
        address,
        port
    );
    if (!result.successful) {
        throw new Error(
            'The node consensus status and cryptographic parameters could not be retrieved'
        );
    }

    const consensusStatus: ConsensusStatus = JSON.parse(
        JsonResponse.deserializeBinary(result.response.consensus).getValue()
    );

    const nodeVersionedGlobal: Versioned<Global> = JSON.parse(
        JsonResponse.deserializeBinary(result.response.global).getValue()
    );
    const nodeGlobal = nodeVersionedGlobal.value;

    return { consensusStatus, nodeGlobal };
}

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
            const {
                consensusStatus,
                nodeGlobal,
            } = await getConsensusAndGlobalFromNode(address, port);
            const genesis = await getGenesis();
            if (genesis) {
                if (consensusStatus.genesisBlock !== genesis.genesisBlock) {
                    setFailedMessage(
                        'Connecting to a node running on a separate blockchain is not allowed'
                    );
                    setConnected(false);
                    setHasBeenTested(true);
                    setTestingConnection(false);
                    return;
                }
            }

            if (!global && !genesis) {
                await setGenesisAndGlobal(
                    consensusStatus.genesisBlock,
                    nodeGlobal
                );
            }
            await updateValues(address, port);
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
                className="mT50"
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
