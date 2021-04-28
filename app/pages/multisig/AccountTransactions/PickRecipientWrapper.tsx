import React, { useEffect } from 'react';
import { AddressBookEntry } from '~/utils/types';
import PickRecipient from '~/components/Transfers/PickRecipient';

interface Props {
    setReady(ready: boolean): void;
    setRecipient(recipient: AddressBookEntry): void;
    recipient: AddressBookEntry | undefined;
}

/**
 * Wrap the PickRecipient component to use setReady.
 */
export default function PickRecipientWrapper({
    setReady,
    setRecipient,
    recipient,
}: Props) {
    useEffect(() => {
        setReady(Boolean(recipient));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipient]);

    return <PickRecipient pickRecipient={setRecipient} />;
}
