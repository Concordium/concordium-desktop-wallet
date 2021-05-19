import { push } from 'connected-react-router';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '~/cross-app-components/Button';
import {
    ExportKeyType,
    KeyWithStatus,
    PublicKeyExportFormat,
    UpdateType,
    TransactionTypes,
} from '~/utils/types';
import { createProposalRoute } from '~/utils/routerHelper';
import Card from '~/cross-app-components/Card';
import { typeToDisplay } from '~/utils/updates/HigherLevelKeysHelpers';
import CopiableIdenticon from '~/components/CopiableIdenticon/CopiableIdenticon';
import Form from '~/components/Form/Form';
import CloseButton from '~/cross-app-components/CloseButton';
import styles from './ProposeNewKey.module.scss';
import FileInput from '~/components/Form/FileInput';
import { FileInputValue } from '~/components/Form/FileInput/FileInput';
import SimpleErrorModal, {
    ModalErrorInput,
} from '~/components/SimpleErrorModal';

interface Props {
    newKeys: KeyWithStatus[];
    type: UpdateType;
    addKey: (publicKey: PublicKeyExportFormat) => void;
}

/**
 * Validates whether the key type and the update type matches. This is used to validate whether
 * an imported key file matches keys that are being updated.
 * @param type the update type of the current proposal
 * @param keyType the key type from the imported key file
 * @returns true if the type and keyType matches, otherwise false and the key should be rejected
 */
function isMatchingKeyType(type: UpdateType, keyType: ExportKeyType): boolean {
    return (
        (UpdateType.UpdateRootKeys === type &&
            ExportKeyType.Root === keyType) ||
        ([
            UpdateType.UpdateLevel1KeysUsingRootKeys,
            UpdateType.UpdateLevel1KeysUsingLevel1Keys,
        ].includes(type) &&
            ExportKeyType.Level1 === keyType) ||
        ([
            UpdateType.UpdateLevel2KeysUsingRootKeys,
            UpdateType.UpdateLevel2KeysUsingLevel1Keys,
        ].includes(type) &&
            ExportKeyType.Level2 === keyType)
    );
}

/**
 * Component that allows the user to import a file that contains
 * a key that should be added to the proposal.
 */
export default function ProposeNewKey({ type, addKey, newKeys }: Props) {
    const dispatch = useDispatch();
    const [loadedKey, setLoadedKey] = useState<PublicKeyExportFormat>();
    const [showError, setShowError] = useState<ModalErrorInput>({
        show: false,
    });

    /**
     * Loads the public-key governance key file supplied. If the key
     * is already present in the proposal, then the duplicate state
     * is set (to trigger a modal).
     */
    async function fileProcessor(file: FileInputValue) {
        if (file) {
            const rawData = Buffer.from(await file[0].arrayBuffer());

            let exportedPublicKey: PublicKeyExportFormat;
            try {
                exportedPublicKey = JSON.parse(rawData.toString('utf-8'));
            } catch (e) {
                setShowError({
                    show: true,
                    header: 'Invalid key file',
                    content: 'The loaded file did not contain a valid key.',
                });
                return;
            }

            if (!isMatchingKeyType(type, exportedPublicKey.type)) {
                setShowError({
                    show: true,
                    header: 'Invalid key type',
                    content:
                        'The loaded key file contains a key of a different type, than the keys you are attempting to update. Please try another governance key file.',
                });
                return;
            }
            const duplicateKey = newKeys
                .map((key) => key.key.verifyKey)
                .includes(exportedPublicKey.key.verifyKey);
            if (duplicateKey) {
                setShowError({
                    show: true,
                    header: 'Duplicate key',
                    content:
                        'The loaded key file contains a key that is already present on the proposal. Please try another governance key file.',
                });
                return;
            }

            setLoadedKey(exportedPublicKey);
        }
    }

    function addNewKey() {
        if (loadedKey) {
            addKey(loadedKey);
            setLoadedKey(undefined);
        }
    }

    return (
        <>
            <SimpleErrorModal
                show={showError.show}
                header={showError.header}
                content={showError.content}
                onClick={() => {
                    setShowError({ show: false });
                    setLoadedKey(undefined);
                }}
            />
            <div className="flexColumn flexChildFill">
                <h3>Do you want to propose a new key?</h3>
                <p className="m0">
                    You can add a new key by dropping it below. If you do not
                    want to make changes to the keys, then you can continue to
                    change the signature threshold.
                </p>
                {!loadedKey && (
                    <FileInput
                        className={styles.fileInput}
                        buttonTitle="Drag and drop key file here"
                        value={null}
                        onChange={fileProcessor}
                    />
                )}
                {loadedKey && (
                    <Card className="mB40 relative">
                        <CloseButton
                            className={styles.close}
                            onClick={() => setLoadedKey(undefined)}
                        />
                        <h2>New {typeToDisplay(type)} key</h2>
                        <p>{loadedKey.key.verifyKey}</p>
                        <CopiableIdenticon data={loadedKey.key.verifyKey} />
                        <Form onSubmit={addNewKey}>
                            <Form.Checkbox
                                className={styles.checkbox}
                                name="agree"
                                rules={{
                                    required:
                                        'You must confirm that the keys match',
                                }}
                            >
                                <span>
                                    The key and identicons matches those of the
                                    new custodian <b>exactly</b>.
                                </span>
                            </Form.Checkbox>
                            <Form.Submit>Add key</Form.Submit>
                        </Form>
                    </Card>
                )}
            </div>
            <Button
                onClick={() =>
                    dispatch(
                        push(
                            `${createProposalRoute(
                                TransactionTypes.UpdateInstruction,
                                type
                            )}/keysetsize`
                        )
                    )
                }
            >
                Continue
            </Button>
        </>
    );
}
