import { push } from 'connected-react-router';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import DragAndDropFile from '~/components/DragAndDropFile';
import Button from '~/cross-app-components/Button';
import { PublicKeyExportFormat } from '../../ExportKeyView/ExportKeyView';
import { UpdateType } from '~/utils/types';
import { createProposalRoute } from '~/utils/routerHelper';
import Card from '~/cross-app-components/Card';
import { typeToDisplay } from '~/utils/updates/HigherLevelKeysHelpers';
import CopiableIdenticon from '~/components/CopiableIdenticon/CopiableIdenticon';
import Form from '~/components/Form/Form';
import CloseButton from '~/cross-app-components/CloseButton';
import styles from './ProposeNewKey.module.scss';

interface Props {
    type: UpdateType;
    addKey: (publicKey: PublicKeyExportFormat) => void;
}

// TODO Check if the loaded key is already present in the update already, and show
// an error modal if that is the case.

// TODO Make it match what happens in Figma, where after loading a file it displays a new box
// instead of the drag and drop file.

/**
 * Component that allows the user to import a file that contains
 * a higher level governance key that should be added to the proposal.
 */
export default function ProposeNewKey({ type, addKey }: Props) {
    const [loadedKey, setLoadedKey] = useState<PublicKeyExportFormat>();
    const dispatch = useDispatch();

    async function fileProcessor(rawData: Buffer) {
        // TODO Validate whether the key is already present or not at this point.

        const publicKey: PublicKeyExportFormat = JSON.parse(
            rawData.toString('utf-8')
        );
        setLoadedKey(publicKey);
    }

    function addNewKey() {
        if (loadedKey) {
            addKey(loadedKey);
            setLoadedKey(undefined);
        }
    }

    return (
        <>
            <div>
                <h2>Do you want to propose a new key?</h2>
                <p>
                    You can add a new key by dropping it below. If you do not
                    want to make changes to the keys, then you can continue to
                    change the signature threshold.
                </p>
                {!loadedKey && (
                    <DragAndDropFile
                        text="Drag and drop key file here"
                        fileProcessor={fileProcessor}
                    />
                )}
                {loadedKey && (
                    <Card>
                        <CloseButton
                            className={styles.close}
                            onClick={() => setLoadedKey(undefined)}
                        />
                        <h2>New {typeToDisplay(type)} key</h2>
                        <p>{loadedKey.verifyKey}</p>
                        <CopiableIdenticon data={loadedKey.verifyKey} />
                        <Form onSubmit={addNewKey}>
                            <Form.Checkbox
                                name="agree"
                                rules={{
                                    required:
                                        'You must confirm that the keys match',
                                }}
                            >
                                The key and identicons matches those of the new
                                custodian <b>exactly</b>.
                            </Form.Checkbox>
                            <Form.Submit>Add key</Form.Submit>
                        </Form>
                    </Card>
                )}
            </div>
            <Button
                onClick={() =>
                    dispatch(push(`${createProposalRoute(type)}/keysetsize`))
                }
            >
                Continue
            </Button>
        </>
    );
}
