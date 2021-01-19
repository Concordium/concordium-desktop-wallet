import React from 'react';
import { useLocation } from 'react-router-dom';
import { Divider, Segment } from 'semantic-ui-react';

export default function Routes() {
    const location = useLocation();
    const title = location.pathname.substring(1); // TODO: make properly
    const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);

    return (
        <Segment basic textAlign="center">
            <h1>{capitalizedTitle}</h1>
            <Divider />
        </Segment>
    );
}

/**
 * <div className={styles.header}>
            <h1>{title}</h1>
        </div>
 */
