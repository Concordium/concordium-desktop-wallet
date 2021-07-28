import React, { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import TermsPage from '~/pages/TermsPage';
import { RootState } from '~/store/store';

type Props = PropsWithChildren<unknown>;

export default function TermsAcceptanceGuard({ children }: Props): JSX.Element {
    const { termsAccepted } = useSelector((s: RootState) => s.misc);

    if (!termsAccepted) {
        return <TermsPage mustAccept />;
    }

    return <>{children}</>;
}
