import React, { PropsWithChildren } from 'react';
import Card from '~/cross-app-components/Card';

import styles from './StakingDetails.module.scss';

type Props = PropsWithChildren<{
    title: string;
}>;

export default function StakingDetails({ children, title }: Props) {
    return (
        <Card className={styles.root} dark>
            <header className={styles.header}>
                <h3 className="mB0">{title}</h3>
            </header>
            {children}
        </Card>
    );
}
