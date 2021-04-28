import React from 'react';

interface Props {
    electionDifficulty: number;
}

/**
 * Displays an overview of an election difficulty transaction payload.
 */
export default function ElectionDifficultyView({ electionDifficulty }: Props) {
    return (
        <>
            <h3>Election difficulty</h3>
            <h4>{electionDifficulty}/100000</h4>
        </>
    );
}
