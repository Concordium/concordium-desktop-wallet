import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Form, Input, Button, Header, Label, Segment } from 'semantic-ui-react';
import { updateSettingEntry } from '../../features/SettingsSlice';
import { Setting } from '../../utils/types';
import { setClientLocation, getNodeInfo } from '../../utils/nodeRequests';

interface Props {
    setting: Setting;
}

const portRangeMax = 65535;
// Determine whether the given string represent a valid port value.
// TODO: improve this not allow non-integer input like ''100adadaifo'.
function validatePort(port: string) {
    try {
        const portValue = parseInt(port, 10);
        return portValue <= portRangeMax && portValue > 0;
    } catch (e) {
        return false;
    }
}

/**
 * A component for connection settings that are updated automatically on changes.
 *  N.B. right now is fixed to node location setting.
 */
export default function ConnectionSetting({ setting }: Props) {
    const dispatch = useDispatch();
    const startValues = JSON.parse(setting.value);
    const [address, setAddress] = useState(startValues.address);
    const [port, setPort] = useState(startValues.port);
    const [testResult, setTestResult] = useState<string>('');
    const [testingConnection, setTestingConnection] = useState<boolean>(false);
    const [inputValid, setInputValid] = useState<boolean>(true);

    // Ideally this should have a debounce, so that we wait a little before actually
    // storing to the database. As we are uncertain if there will be a submit button
    // or not, we will keep it as is for now.
    function updateValues(newAddress: string, newPort: string) {
        if (validatePort(newPort)) {
            setInputValid(true);
        } else {
            setInputValid(false);
            return;
        }

        setClientLocation(newAddress, newPort); // TODO: generalize
        updateSettingEntry(dispatch, {
            ...setting,
            value: JSON.stringify({
                address: newAddress,
                port: newPort,
            }),
        });
    }

    async function testConnection() {
        // TODO: generalize
        setTestingConnection(true);
        setTestResult('contacting node...');
        try {
            const result = await getNodeInfo();
            setTestResult(`Connected to node with id: ${result.getNodeId()}`);
        } catch (e) {
            setTestResult('Unable to connect');
        }
        setTestingConnection(false);
    }

    return (
        <Segment>
            <Form.Field>
                <Header>{setting.name}</Header>
                <Form.Field>
                    <Input
                        label="Address"
                        defaultValue={address}
                        onChange={(event) => {
                            const newAddress = event.target.value;
                            setAddress(newAddress);
                            updateValues(newAddress, port);
                        }}
                    />
                </Form.Field>
                <Form.Field>
                    <Input
                        label="Port"
                        defaultValue={port}
                        onChange={(event) => {
                            const newPort = event.target.value;
                            setPort(newPort);
                            updateValues(address, newPort);
                        }}
                    />
                </Form.Field>
                <Button as="div" labelPosition="right">
                    <Button
                        positive
                        disabled={testingConnection || !inputValid}
                        onClick={testConnection}
                    >
                        Test connection
                    </Button>
                    <Label basic>{testResult}</Label>
                </Button>
            </Form.Field>
        </Segment>
    );
}
