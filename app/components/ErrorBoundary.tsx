/* eslint-disable react/destructuring-assignment, react/static-property-placement */
import { Component, ErrorInfo, PropsWithChildren } from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
}

type ErrorBoundaryProps = PropsWithChildren<{
    fallback?: JSX.Element | null;
}>;

export default class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    static defaultProps: ErrorBoundaryProps = {
        fallback: null,
    };

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // You can also log the error to an error reporting service
        window.log.error(error);
        // eslint-disable-next-line no-console
        console.error(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }

        return this.props.children;
    }
}
