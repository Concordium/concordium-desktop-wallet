import React from 'react';
import SidedRow from './SidedRow';
import CopyButton from './CopyButton';

interface Props {
    title: string;
    value: string;
    note?: string;
    className?: string;
}

/**
 * This Display the title (and the note) and contains an CopyButton, that, when pressed, copies the given value into the user's clipboard.
 */
function CopiableListElement({
    title,
    value,
    note,
    className,
}: Props): JSX.Element {
    return (
        <SidedRow
            className={className}
            left={
                <>
                    {title} {'\n'}
                    {value} {note ? `(${note})` : undefined}
                </>
            }
            right={<CopyButton value={value} />}
        />
    );
}

CopiableListElement.defaultProps = {
    note: undefined,
};

export default CopiableListElement;
