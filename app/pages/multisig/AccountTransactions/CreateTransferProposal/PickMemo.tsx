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
            <p className="mT50">
                You can add a message to your transactions. This step is
                optional, and it will increase the transaction fee. Feel free to
                leave it blank if you do not need it.
            </p>
            <TextArea
                value={memo || ''}
                className="mT10"
                onChange={onMemoChange}
                placeholder="You can add a memo here"
            />
            <ErrorMessage>{error}</ErrorMessage>
        </>
    );
}
