import React from 'react';
import ButtonNavLink from '~/components/ButtonNavLink';
import routes from '~/constants/routes.json';
import styles from '../Settings.module.scss';

export default function About(): JSX.Element {
    return (
        <>
            <ButtonNavLink
                key={routes.SETTINGS_TERMS}
                className={styles.item}
                to={routes.SETTINGS_TERMS}
            >
                Terms & Conditions
            </ButtonNavLink>
            <ButtonNavLink
                key={routes.SETTINGS_LICENSES}
                className={styles.item}
                to={routes.SETTINGS_LICENSES}
            >
                License notices
            </ButtonNavLink>
        </>
    );
}
