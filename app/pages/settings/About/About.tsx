import React from 'react';
import ButtonNavLink from '~/components/ButtonNavLink';
import routes from '~/constants/routes.json';

import styles from '../Settings.module.scss';

export default function About(): JSX.Element {
    return (
        <ButtonNavLink className={styles.item} to={routes.SETTINGS_TERMS}>
            Terms & Conditions
        </ButtonNavLink>
    );
}
