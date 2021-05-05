import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import routes from '~/constants/routes.json';
import attributeNames from '~/constants/attributeNames.json';
import { ChosenAttributes, Identity, IdentityObject } from '~/utils/types';
import IdentityCard from '~/components/IdentityCard';
import Columns from '~/components/Columns';
import Button from '~/cross-app-components/Button';
import CardList from '~/cross-app-components/CardList';
import Checkbox from '~/components/Form/Checkbox';
import Card from '~/cross-app-components/Card';
import { formatAttributeValue } from '~/utils/identityHelpers';

import generalStyles from '../AccountCreation.module.scss';
import styles from './PickAttributes.module.scss';

interface Props {
    identity: Identity;
    setChosenAttributes: (attributes: string[]) => void;
    chosenAttributes: string[] | undefined;
}

interface Attribute {
    tag: string;
    value: string;
    isChecked: boolean;
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
            tag,
            value,
            isChecked: Boolean(chosenAttributes?.includes(tag)),
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
                            Submit with reveaed attributes
                        </Button>
                    </div>
                </div>
            </Columns.Column>
            <Columns.Column noResize>
                <CardList className={generalStyles.rightColumn}>
                    <IdentityCard
                        className={generalStyles.identityColumnElement}
                        identity={identity}
                        active
                    />
                    <Card
                        className={clsx(
                            generalStyles.identityColumnElement,
                            styles.attributesCard
                        )}
                    >
                        {attributes.map((a) => (
                            <Checkbox
                                className={styles.checkbox}
                                key={a.tag}
                                size="large"
                                checked={a.isChecked}
                                onClick={() => toggleAttribute(a.tag)}
                            >
                                <div className="flexChildFill flex justifySpaceBetween">
                                    <span>
                                        {
                                            (attributeNames as Record<
                                                string,
                                                string
                                            >)[a.tag]
                                        }
                                    </span>
                                    <span>
                                        {formatAttributeValue(
                                            a.tag as keyof ChosenAttributes,
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
