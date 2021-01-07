import React from 'react';
import styles from './Transaction.css';

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
                <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(value)}
                >
                    copy
                </button>
            </div>
        </div>
    );
}

CopiableListElement.defaultProps = {
    note: undefined,
};

export default CopiableListElement;
