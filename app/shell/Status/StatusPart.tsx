import React from 'react';

import styles from './Status.module.scss';

interface IconProps {
    height: string;
}

interface Props {
    name: string;
    status: string;
    Icon: (props: IconProps) => JSX.Element | null;
}

export default function Status({ name, status, Icon }: Props) {
    return (
        <div className={styles.part}>
            <div className={styles.text}>
                <span className={styles.name}>{name}</span>
                <span className={styles.status}>{status}</span>
            </div>
            {Icon ? <Icon height="15" /> : null}
        </div>
    );
}
