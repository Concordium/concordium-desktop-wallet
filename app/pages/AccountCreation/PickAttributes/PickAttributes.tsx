import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import routes from '~/constants/routes.json';
import { Identity, IdentityObject } from '~/utils/types';
import IdentityCard from '~/components/IdentityCard';
import Columns from '~/components/Columns';
import Button from '~/cross-app-components/Button';
import CardList from '~/cross-app-components/CardList';
import Checkbox from '~/components/Form/Checkbox';
import Card from '~/cross-app-components/Card';
import {
    AttributeKey,
    attributeNamesMap,
    formatAttributeValue,
} from '~/utils/identityHelpers';

import generalStyles from '../AccountCreation.module.scss';
import styles from './PickAttributes.module.scss';

const revealableAttributes: AttributeKey[] = [
    'countryOfResidence',
    'nationality',
    'idDocType',
    'idDocIssuer',
];

interface Attribute {
    tag: AttributeKey;
    value: string;
    isChecked: boolean;
}

interface Props {
    identity: Identity;
    setChosenAttributes: (attributes: AttributeKey[]) => void;
    chosenAttributes: AttributeKey[] | undefined;
}

export default function AccountCreationPickAttributes({
    identity,
    setChosenAttributes,
    chosenAttributes,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const [attributes, setAttributes] = useState<Attribute[]>(() => {
        const identityObject: IdentityObject = JSON.parse(
            identity.identityObject
        ).value;

        return Object.entries(
            identityObject.attributeList.chosenAttributes
        ).map(([tag, value]) => ({
            tag: tag as AttributeKey,
            value,
            isChecked: Boolean(chosenAttributes?.includes(tag as AttributeKey)),
        }));
    });

    function toggleAttribute(tag: string): void {
        setAttributes((v) =>
            v.map((a) =>
                a.tag === tag ? { ...a, isChecked: !a.isChecked } : a
            )
        );
    }

    function submit() {
        setChosenAttributes(
            attributes.filter((x) => x.isChecked).map((x) => x.tag)
        );
        dispatch(push(routes.ACCOUNTCREATION_GENERATE));
    }

    return (
        <Columns columnScroll variableSize>
            <Columns.Column>
                <div className={generalStyles.leftColumn}>
                    <h2>Choose which attributes to reveal</h2>
                    <div className="flexChildFill flexColumn justifySpaceBetween">
                        <div>
                            <p>
                                On the right you can choose which attributes you
                                want to reveal on your account. You can choose
                                however many you want, including none.
                            </p>
                            <p>Which attributes do you want to reveal?</p>
                        </div>
                        <Button
                            className={generalStyles.button}
                            onClick={submit}
                        >
                            Submit with revealed attributes
                        </Button>
                    </div>
                </div>
            </Columns.Column>
            <Columns.Column noResize>
                <CardList className={generalStyles.rightColumn}>
                    <IdentityCard
                        className={generalStyles.card}
                        identity={identity}
                        active
                    />
                    <Card className={clsx(generalStyles.card, 'p0')}>
                        {attributes
                            .filter((a) => revealableAttributes.includes(a.tag))
                            .map((a) => (
                                <Checkbox
                                    className={styles.checkbox}
                                    key={a.tag}
                                    size="large"
                                    checked={a.isChecked}
                                    onClick={() => toggleAttribute(a.tag)}
                                >
                                    <div className="flexChildFill flex justifySpaceBetween mL10">
                                        <span>{attributeNamesMap[a.tag]}</span>
                                        <span>
                                            {formatAttributeValue(
                                                a.tag,
                                                a.value
                                            )}
                                        </span>
                                    </div>
                                </Checkbox>
                            ))}
                    </Card>
                </CardList>
            </Columns.Column>
        </Columns>
    );
}
