import {
    PropsWithChildren,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
} from 'react';
import ReactDOM from 'react-dom';

interface PortalProps {
    root?: HTMLElement | null;
    className?: string;
}

const defaultRoot = document.getElementsByTagName('body')[0];

export default function Portal({
    root: r,
    children,
    className,
}: PropsWithChildren<PortalProps>) {
    const { current: el } = useRef(document.createElement('div'));
    const root = useMemo(() => r ?? defaultRoot, [r]);

    useEffect(() => {
        if (className) {
            el.classList.value = className;
        }
    }, [el, className]);

    useLayoutEffect(() => {
        root.appendChild(el);

        return () => {
            root.removeChild(el);
        };
    }, [root, el]);

    return ReactDOM.createPortal(children, el);
}
