import React from 'react';

export default function TodoPage() {
    const currentURL = window.location.href;
    return (
        <div>
            {' '}
            TODO {currentURL.substring(currentURL.lastIndexOf('#') + 1)}{' '}
        </div>
    );
}
