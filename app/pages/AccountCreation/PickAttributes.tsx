import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import routes from '~/constants/routes.json';
import { Identity, AttributeKeyName } from '~/utils/types';
import IdentityCard from '~/components/IdentityCard';
import Columns from '~/components/Columns';
import Button from '~/cross-app-components/Button';
import CardList from '~/cross-app-components/CardList';
import SelectIdentityAttributes from '~/components/SelectIdentityAttributes';

import styles from './AccountCreation.module.scss';

interface Props {
    identity: Identity;
    setChosenAttributes: (attributes: AttributeKeyName[]) => void;
    chosenAttributes: AttributeKeyName[] | undefined;
}

export default function AccountCreationPickAttributes({
    identity,
    setChosenAttributes,
    chosenAttributes,
}: Props): JSX.Element {
    const dispatch = useDispatch();

    function submit() {
        dispatch(push(routes.ACCOUNTCREATION_GENERATE));
    }

    return (
        <Columns columnScroll variableSize>
            <Columns.Column>
                <div className={styles.leftColumn}>
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
                        <Button className={styles.button} onClick={submit}>
                            Submit with revealed attributes
                        </Button>
                    </div>
                </div>
            </Columns.Column>
            <Columns.Column noResize>
                <CardList className={styles.rightColumn}>
                    <IdentityCard
                        className={styles.identityListItem}
                        identity={identity}
                        active
                    />
                    <SelectIdentityAttributes
                        className={styles.identityListItem}
                        identity={identity}
                        chosenAttributes={chosenAttributes}
                        setChosenAttributes={setChosenAttributes}
                    />
                </CardList>
            </Columns.Column>
        </Columns>
    );
}
