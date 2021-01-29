import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Form, Input, Button, Header, Label } from 'semantic-ui-react';
import { updateSettingEntry } from '../../features/SettingsSlice';
import { Setting } from '../../utils/types';
import { setClientLocation, getNodeInfo } from '../../utils/client';

interface Props {
    setting: Setting;
}

/**
 * A component for connection settings that are updated automatically on changes.
 *  N.B. right now is fixed to node location setting.
 *  TODO: Change label to Modal?
 */
export default function ConnectionSetting({ setting }: Props) {
    const dispatch = useDispatch();
    const startValues = JSON.parse(setting.value);
    const [address, setAddress] = useState(startValues.address);
    const [port, setPort] = useState(startValues.port);
    const [testResult, setTestResult] = useState<string>('');

    // Ideally this should have a debounce, so that we wait a little before actually
    // storing to the database. As we are uncertain if there will be a submit button
    // or not, we will keep it as is for now.
    function updateValue(newAddress: string, newPort: string) {
        setClientLocation(newAddress, newPort); // TODO: generalize
        return updateSettingEntry(dispatch, {
            ...setting,
            value: JSON.stringify({
                address: newAddress,
                port: newPort,
            }),
        });
    }

    async function onClick() {
        // TODO: generalize
        try {
            const result = await getNodeInfo();
            setTestResult(`success, id: ${result.getNodeId()}`);
        } catch (e) {
            setTestResult('Unable to Connect');
        }
    }

    return (
        <Form.Field>
            <Header>{setting.name}</Header>
            <Input
                label="Address"
                defaultValue={address}
                onChange={(event) => {
                    const newAddress = event.target.value;
                    setAddress(newAddress);
                    updateValue(newAddress, port);
                }}
            />
            <Input
                label="Port"
                defaultValue={port}
                onChange={(event) => {
                    const newPort = event.target.value;
                    setPort(newPort);
                    updateValue(address, newPort);
                }}
            />
            <Button as="div" labelPosition="right">
                <Button onClick={onClick}>Test Connection!</Button>
                <Label basic>{testResult}</Label>
            </Button>
        </Form.Field>
    );
}
