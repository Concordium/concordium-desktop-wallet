import React from 'react';
import styles from './Transaction.css';
import CopyButton from './CopyButton';

interface Props {
    title: string;
    value: string;
    note?: string;
}

function CopiableListElement({ title, value, note }: Props): JSX.element {
    return (
        <div className={styles.transactionListElement}>
            <pre className={styles.leftAligned}>
                {title} {' \n'}
                {value} {note ? `(${note})` : undefined}
            </pre>
            <div className={styles.rightAligned}>
                <CopyButton value={value} />
            </div>
        </div>
    );
}

CopiableListElement.defaultProps = {
    note: undefined,
};

export default CopiableListElement;
