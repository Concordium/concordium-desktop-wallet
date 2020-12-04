import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../Main.css';

export default function Routes() {
    const location = useLocation();
    const title = location.pathname.substring(1); // TODO: make properly

    return (
        <div className={styles.header}>
            <h1>{title}</h1>
        </div>
    );
}
