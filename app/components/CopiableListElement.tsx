import PropTypes from 'prop-types';
import React from 'react';
import styles from './Transaction.css';

function CopiableListElement({ title, value, extra }): JSX.element {
    return (
        <div className={styles.transactionListElement}>
            <pre className={styles.leftAligned}>
                {title} {' \n'}
                {value} {extra}
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

CopiableListElement.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    extra: PropTypes.string,
};

CopiableListElement.defaultProps = {
    extra: '',
};

export default CopiableListElement;
