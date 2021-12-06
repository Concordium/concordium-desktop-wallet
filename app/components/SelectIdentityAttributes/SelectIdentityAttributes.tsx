import clsx from 'clsx';
import React, { useMemo } from 'react';
import Card from '~/cross-app-components/Card';
import {
    attributeNamesMap,
    formatAttributeValue,
    compareAttributes,
} from '~/utils/identityHelpers';
import {
    ClassName,
    ConfirmedIdentity,
    IdentityObject,
    AttributeKeyName,
} from '~/utils/types';
import Checkbox from '../Form/Checkbox';

import styles from './SelectIdentityAttributes.module.scss';

const revealableAttributes: AttributeKeyName[] = [
    'countryOfResidence',
    'nationality',
    'idDocType',
    'idDocIssuer',
];

interface Props extends ClassName {
    identity: ConfirmedIdentity;
    setChosenAttributes: (attributes: AttributeKeyName[]) => void;
    chosenAttributes: AttributeKeyName[] | undefined;
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

    function toggleAttribute(tag: AttributeKeyName): void {
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
                    revealableAttributes.includes(tag as AttributeKeyName)
                )
                .sort(([k1], [k2]) =>
                    compareAttributes(
                        k1 as AttributeKeyName,
                        k2 as AttributeKeyName
                    )
                )
                .map(([tag, value]) => (
                    <Checkbox
                        className={styles.checkbox}
                        key={tag as AttributeKeyName}
                        size="large"
                        checked={
                            !!chosenAttributes?.includes(
                                tag as AttributeKeyName
                            )
                        }
                        onChange={() =>
                            toggleAttribute(tag as AttributeKeyName)
                        }
                    >
                        <div className="flexChildFill flex justifySpaceBetween mL10">
                            <span>
                                {attributeNamesMap[tag as AttributeKeyName]}
                            </span>
                            <span>
                                {formatAttributeValue(
                                    tag as AttributeKeyName,
                                    value
                                )}
                            </span>
                        </div>
                    </Checkbox>
                ))}
        </Card>
    );
}
