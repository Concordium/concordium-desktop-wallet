import React, { useState, useCallback, FormEvent } from 'react';
import { validateMemo } from '~/utils/transactionHelpers';
import ErrorMessage from '~/components/Form/ErrorMessage';
import TextArea from '~/components/Form/TextArea';

interface Props {
    memo?: string;
    setMemo: (amount: string | undefined) => void;
}

/**
 * Allow the user to input a memo.
 */
export default function PickMemo({ setMemo, memo }: Props): JSX.Element {
    const [error, setError] = useState<string>();

    const onMemoChange = useCallback(
        (event: FormEvent<HTMLTextAreaElement>) => {
            const currentMemo = event.currentTarget.value;
            const validation = validateMemo(currentMemo);
            setError(validation);
            setMemo(currentMemo);
        },
        [setMemo]
    );

    return (
        <>
            <TextArea
                value={memo || ''}
                className="mT50"
                onChange={onMemoChange}
                label={<span className="h3">Memo</span>}
                placeholder="You can add a memo here"
            />
            <ErrorMessage>{error}</ErrorMessage>
        </>
    );
}
