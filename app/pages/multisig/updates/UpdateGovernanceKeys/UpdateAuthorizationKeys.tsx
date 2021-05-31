import React, { useMemo, useState } from 'react';
import Columns from '~/components/Columns/Columns';
import InputTimestamp from '~/components/Form/InputTimestamp/InputTimestamp';
import Button from '~/cross-app-components/Button';
import { BlockSummary, Key } from '~/node/NodeApiTypes';
import {
    getDefaultExpiry,
    getFormattedDateString,
    isFutureDate,
    subtractHours,
    TimeConstants,
} from '~/utils/timeHelpers';
import {
    AccessStructure,
    AuthorizationKeysUpdate,
    KeyUpdateEntryStatus,
    KeyWithStatus,
    UpdateType,
} from '~/utils/types';
import styles from '../../common/MultiSignatureFlowPage.module.scss';
import KeyUpdateEntry from './KeyUpdateEntry';
import mapCurrentAuthorizationsToUpdate from './util';

interface Props {
    blockSummary: BlockSummary;
    type: UpdateType;
    handleKeySubmit(
        effectiveTime: Date,
        expiryTime: Date,
        authorizationKeysUpdate: Partial<AuthorizationKeysUpdate>
    ): Promise<void>;
}

export default function UpdateAuthorizationKeys({
    blockSummary,
    type,
    handleKeySubmit,
}: Props) {
    const [effectiveTime, setEffectiveTime] = useState<Date | undefined>(
        new Date(getDefaultExpiry().getTime() + 5 * TimeConstants.Minute)
    );
    const [expiryTime, setExpiryTime] = useState<Date | undefined>(
        getDefaultExpiry()
    );

    const currentKeys = blockSummary.updates.keys.level2Keys.keys;
    const currentKeySetSize = currentKeys.length;
    const currentAuthorizations = blockSummary.updates.keys.level2Keys;

    const [newLevel2Keys] = useState<AuthorizationKeysUpdate>(
        mapCurrentAuthorizationsToUpdate(currentAuthorizations)
    );

    function updateKey(keyToUpdate: KeyWithStatus) {
        return keyToUpdate;
    }

    const expiryTimeError = useMemo(() => {
        if (expiryTime === undefined) {
            return undefined;
        }
        if (!isFutureDate(expiryTime)) {
            return 'Transaction expiry time must be in the future';
        }
        if (effectiveTime !== undefined && effectiveTime < expiryTime) {
            return 'Expiry must be before the effective time';
        }
        return undefined;
    }, [effectiveTime, expiryTime]);

    function displayAccessStructure(
        accessStructure: AccessStructure,
        title: string,
        keys: Key[]
    ) {
        return (
            <div>
                <h2>{title}</h2>
                <ul>
                    {keys
                        .map((key, index) => {
                            return { key, index };
                        })
                        .filter((result) =>
                            accessStructure.publicKeyIndicies
                                .map((idx) => idx.index)
                                .includes(result.index)
                        )
                        .map((value) => {
                            return (
                                <KeyUpdateEntry
                                    key={value.key.verifyKey}
                                    updateKey={updateKey}
                                    keyInput={{
                                        status: KeyUpdateEntryStatus.Unchanged,
                                        key: value.key,
                                    }}
                                />
                            );
                        })}
                </ul>
            </div>
        );
    }

    function submitFunction() {
        if (!effectiveTime) {
            return;
        }
        if (!expiryTime) {
            return;
        }
        handleKeySubmit(effectiveTime, expiryTime, {
            ...newLevel2Keys,
            keyUpdateType: 2,
        });
    }

    return (
        <Columns divider columnScroll columnClassName={styles.column}>
            <Columns.Column header="Transaction Details">
                <div className={styles.columnContent}>
                    <p>{type}</p>
                    <p>
                        Current size of level 2 key set:{' '}
                        <b>{currentKeySetSize}</b>
                    </p>
                    <p>
                        New size of level 2 key set:{' '}
                        <b>{newLevel2Keys.keys.length}</b>
                    </p>
                    <h5>Effective time</h5>
                    <InputTimestamp
                        value={effectiveTime}
                        onChange={setEffectiveTime}
                    />
                    <h5>Transaction expiry time</h5>
                    <InputTimestamp
                        value={expiryTime}
                        onChange={setExpiryTime}
                        isInvalid={expiryTimeError !== undefined}
                        error={expiryTimeError}
                    />
                    {expiryTime !== undefined ? (
                        <p>
                            Note: A transaction can only be submitted in the 2
                            hours before the expiry <br /> (
                            {getFormattedDateString(
                                subtractHours(2, expiryTime)
                            )}
                            )
                        </p>
                    ) : undefined}
                    {displayAccessStructure(
                        newLevel2Keys.emergency,
                        'Emergency',
                        currentKeys
                    )}
                    {displayAccessStructure(
                        newLevel2Keys.protocol,
                        'Protocol update',
                        currentKeys
                    )}
                    {displayAccessStructure(
                        newLevel2Keys.electionDifficulty,
                        'Election difficulty',
                        currentKeys
                    )}
                    {displayAccessStructure(
                        newLevel2Keys.euroPerEnergy,
                        'Euro per energy',
                        currentKeys
                    )}
                    {displayAccessStructure(
                        newLevel2Keys.microGtuPerEuro,
                        'Micro GTU per Euro',
                        currentKeys
                    )}
                    {displayAccessStructure(
                        newLevel2Keys.foundationAccount,
                        'Foundation account',
                        currentKeys
                    )}
                    {displayAccessStructure(
                        newLevel2Keys.mintDistribution,
                        'Mint distribution',
                        currentKeys
                    )}
                    {displayAccessStructure(
                        newLevel2Keys.transactionFeeDistribution,
                        'Transaction fee distribution',
                        currentKeys
                    )}
                    {displayAccessStructure(
                        newLevel2Keys.gasRewards,
                        'GAS rewards',
                        currentKeys
                    )}
                    {displayAccessStructure(
                        newLevel2Keys.bakerStakeThreshold,
                        'Baker stake threshold',
                        currentKeys
                    )}
                    {displayAccessStructure(
                        newLevel2Keys.addAnonymityRevoker,
                        'Add anonymity revoker',
                        currentKeys
                    )}
                    {displayAccessStructure(
                        newLevel2Keys.addIdentityProvider,
                        'Add identity provider',
                        currentKeys
                    )}
                </div>
            </Columns.Column>
            <Columns.Column>
                <Button onClick={submitFunction}>Submit</Button>
            </Columns.Column>
        </Columns>
    );
}
