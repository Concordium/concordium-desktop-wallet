import clsx from 'clsx';
import React, { useMemo } from 'react';
import Card from '~/cross-app-components/Card';
import {
    AttributeKey,
    attributeNamesMap,
    formatAttributeValue,
} from '~/utils/identityHelpers';
import { ClassName, Identity, IdentityObject } from '~/utils/types';
import Checkbox from '../Form/Checkbox';

import styles from './SelectIdentityAttributes.module.scss';

const revealableAttributes: AttributeKey[] = [
    'countryOfResidence',
    'nationality',
    'idDocType',
    'idDocIssuer',
];

interface Props extends ClassName {
    identity: Identity;
    setChosenAttributes: (attributes: AttributeKey[]) => void;
    chosenAttributes: AttributeKey[] | undefined;
}

export default function SelectIdentityAttributes({
    className,
    identity,
    setChosenAttributes,
    chosenAttributes,
}: Props): JSX.Element {
    const attributes = useMemo(() => {
        const identityObject: IdentityObject = JSON.parse(
            identity.identityObject
        ).value;

        return identityObject.attributeList.chosenAttributes;
    }, [identity]);

    function toggleAttribute(tag: AttributeKey): void {
        if (chosenAttributes?.includes(tag)) {
            setChosenAttributes(chosenAttributes.filter((a) => a !== tag));
        } else {
            setChosenAttributes([...(chosenAttributes ?? []), tag]);
        }
    }

    return (
        <Card className={clsx('p0', className)}>
            {Object.entries(attributes)
                .filter(([tag]) =>
                    revealableAttributes.includes(tag as AttributeKey)
                )
                .map(([tag, value]) => (
                    <Checkbox
                        className={styles.checkbox}
                        key={tag as AttributeKey}
                        size="large"
                        checked={
                            !!chosenAttributes?.includes(tag as AttributeKey)
                        }
                        onChange={() => toggleAttribute(tag as AttributeKey)}
                    >
                        <div className="flexChildFill flex justifySpaceBetween mL10">
                            <span>
                                {attributeNamesMap[tag as AttributeKey]}
                            </span>
                            <span>
                                {formatAttributeValue(
                                    tag as AttributeKey,
                                    value
                                )}
                            </span>
                        </div>
                    </Checkbox>
                ))}
        </Card>
    );
}
