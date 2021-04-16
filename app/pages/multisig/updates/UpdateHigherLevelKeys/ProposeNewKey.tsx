import { push } from 'connected-react-router';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import DragAndDropFile from '~/components/DragAndDropFile';
import Button from '~/cross-app-components/Button';
import { PublicKeyExportFormat } from '../../ExportKeyView/ExportKeyView';
import { KeyWithStatus, UpdateType } from '~/utils/types';
import { createProposalRoute } from '~/utils/routerHelper';
import Card from '~/cross-app-components/Card';
import { typeToDisplay } from '~/utils/updates/HigherLevelKeysHelpers';
import CopiableIdenticon from '~/components/CopiableIdenticon/CopiableIdenticon';
import Form from '~/components/Form/Form';
import CloseButton from '~/cross-app-components/CloseButton';
import styles from './ProposeNewKey.module.scss';
import Modal from '~/cross-app-components/Modal';

interface Props {
    newKeys: KeyWithStatus[];
    type: UpdateType;
    addKey: (publicKey: PublicKeyExportFormat) => void;
}

/**
 * Component that allows the user to import a file that contains
 * a key that should be added to the proposal.
 */
export default function ProposeNewKey({ type, addKey, newKeys }: Props) {
    const dispatch = useDispatch();
    const [loadedKey, setLoadedKey] = useState<PublicKeyExportFormat>();
    const [duplicate, setDuplicate] = useState(false);

    /**
     * Loads the public-key governance key file supplied. If the key
     * is already present in the proposal, then the duplicate state
     * is set (to trigger a modal).
     */
    async function fileProcessor(rawData: Buffer) {
        const exportedPublicKey: PublicKeyExportFormat = JSON.parse(
            rawData.toString('utf-8')
        );

        const duplicateKey = newKeys
            .map((key) => key.verifyKey.verifyKey)
            .includes(exportedPublicKey.verifyKey.verifyKey);
        if (duplicateKey) {
            setDuplicate(true);
            return;
        }

        setLoadedKey(exportedPublicKey);
    }

    function addNewKey() {
        if (loadedKey) {
            addKey(loadedKey);
            setLoadedKey(undefined);
        }
    }

    return (
        <>
            <Modal
                open={duplicate}
                onClose={() => {
                    setDuplicate(false);
                    setLoadedKey(undefined);
                }}
                onOpen={() => {}}
            >
                <h2>Duplicate key</h2>
                <p>
                    The loaded key file contains a key that is already present
                    on the proposal. Please try another governance key file.
                </p>
            </Modal>
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
                        <p>{loadedKey.verifyKey.verifyKey}</p>
                        <CopiableIdenticon
                            data={loadedKey.verifyKey.verifyKey}
                        />
                        <Form onSubmit={addNewKey}>
                            <Form.Checkbox
                                className={styles.checkbox}
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
