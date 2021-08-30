import React, { AnchorHTMLAttributes, MouseEventHandler } from 'react';

const interceptClickEvent: MouseEventHandler<HTMLAnchorElement> = (e) => {
    const { currentTarget } = e;
    if (currentTarget.tagName === 'A') {
        e.preventDefault();
        const href = currentTarget.getAttribute('href');

        if (href) {
            window.openUrl(href);
        }
    }
};

type ExternalLinkProps = Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    'onClick'
>;

export default function ExternalLink({
    children,
    ...props
}: ExternalLinkProps) {
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <a {...props} onClick={interceptClickEvent}>
            {children}
        </a>
    );
}
