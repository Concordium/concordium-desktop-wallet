import React, { useState } from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { updateSettingEntry } from '~/features/SettingsSlice';
import { globalSelector } from '~/features/GlobalSlice';
import { Setting } from '~/utils/types';
import startClient from '~/node/nodeConnector';
import Card from '~/cross-app-components/Card';
import Form from '~/components/Form';
import ConnectionStatusComponent, {
    Status,
} from '~/components/ConnectionStatusComponent';
import getGenesis from '~/database/GenesisDao';
import { displayTargetNet, getTargetNet, Net } from '~/utils/ConfigHelper';
import genesisBlocks from '~/constants/genesis.json';

import styles from './ConnectionSettingElement.module.scss';

interface Props {
    displayText: string;
    setting: Setting;
    className?: string;
}

const portRangeMax = 65535;

/**
 * Validates whether the provided genesis block hash matches the net that
 * the application was built for. This is used to prevent users from connecting
 * to nodes on a testnet or stagenet.
 *
 * We do not validate the genesis block hash for testnet and stagenet, as they
 * can change often.
 * @param genesisBlockHash the genesis block hash from the node
 * @returns true if the genesis block hash is valid for the application
 */
function isMatchingGenesisBlock(genesisBlockHash: string, targetNet: Net) {
    if (targetNet === Net.Mainnet) {
        return genesisBlocks.mainnet === genesisBlockHash;
    }
    return true;
}

/**
 * Retrieves the consesus status and global cryptographic parameters from the
 * node with the given address and port.
 */
async function getConsensusAndGlobalFromNode(
    address: string,
    port: string,
    useSsl: boolean
) {
    const result = await window.grpc.nodeConsensusAndGlobal(
        address,
        port,
        useSsl
    );
    if (!result.successful) {
        throw new Error(
            'The node consensus status and cryptographic parameters could not be retrieved'
        );
    }
    const { global, consensusStatus } = result.response;
    return { consensusStatus, nodeGlobal: global };
}

/**
 * A component for connection settings that are updated automatically on changes.
 * N.B. right now is fixed to node location setting.
 */
export default function ConnectionSetting({
    displayText,
    setting,
    className,
}: Props) {
    const dispatch = useDispatch();
    const startValues = JSON.parse(setting.value);
    const global = useSelector(globalSelector);
    const [address, setAddress] = useState(startValues.address);
    const [port, setPort] = useState(startValues.port);
    const [useSsl, setUseSsl] = useState(Boolean(startValues.useSsl));
    const [connected, setConnected] = useState<boolean>();
    const [hasBeenTested, setHasBeenTested] = useState<boolean>(false);
    const [testingConnection, setTestingConnection] = useState<boolean>(false);
    const [failedMessage, setFailedMessage] = useState<string>();

    async function updateValues(
        newAddress: string,
        newPort: string,
        newUseSsl: boolean
    ) {
        startClient(dispatch, newAddress, newPort, newUseSsl);
        updateSettingEntry(dispatch, {
            ...setting,
            value: JSON.stringify({
                address: newAddress,
                port: newPort,
                useSsl: newUseSsl,
            }),
        });
    }

    async function setConnection() {
        setTestingConnection(true);
        try {
            const {
                consensusStatus,
                nodeGlobal,
            } = await getConsensusAndGlobalFromNode(address, port, useSsl);
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

            const targetNet = getTargetNet();
            if (
                !isMatchingGenesisBlock(consensusStatus.genesisBlock, targetNet)
            ) {
                setFailedMessage(
                    `The node is not part of ${displayTargetNet(
                        targetNet
                    )}. Please connect to another node.`
                );
                setConnected(false);
                setHasBeenTested(true);
                setTestingConnection(false);
                return;
            }

            if (!global && !genesis) {
                await window.database.genesisAndGlobal.setValue(
                    consensusStatus.genesisBlock,
                    nodeGlobal
                );
            }
            await updateValues(address, port, useSsl);
            setConnected(true);
        } catch (e) {
            setFailedMessage('Connection failed');
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
        <Card className={clsx(styles.connection, className)}>
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
                <Form.Checkbox
                    name="useSsl"
                    defaultChecked={useSsl}
                    onChange={(event) =>
                        setUseSsl(Boolean(event.target.checked))
                    }
                >
                    Use SSL
                </Form.Checkbox>
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
