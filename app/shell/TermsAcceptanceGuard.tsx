import React, { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';
import { termsAcceptedSelector } from '~/features/SettingsSlice';
import TermsPage from '~/pages/settings/About/TermsPage';

type Props = PropsWithChildren<unknown>;

export default function TermsAcceptanceGuard({ children }: Props): JSX.Element {
    const termsAccepted = useSelector(termsAcceptedSelector);

    if (!termsAccepted) {
        return <TermsPage mustAccept />;
    }

    return <>{children}</>;
}
