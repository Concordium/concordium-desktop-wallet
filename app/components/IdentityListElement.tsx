import React from 'react';
import PropTypes from 'prop-types';
import styles from './Accounts.css';

function IdentityListElement({
    identity,
    onClick,
    highlighted,
    index,
}): JSX.Element {
    return (
        <div
            onClick={onClick}
            key={identity.name}
            tabIndex={index}
            className={`${styles.accountListElement} ${
                highlighted ? styles.chosenAccountListElement : null
            }`}
        >
            {identity.provider} {identity.status} {identity.name}
        </div>
    );
}

IdentityListElement.propTypes = {
    identity: PropTypes.shape({
        status: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        provider: PropTypes.string.isRequired,
    }).isRequired,
    onClick: PropTypes.func.isRequired,
    highlighted: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
};

export default IdentityListElement;
