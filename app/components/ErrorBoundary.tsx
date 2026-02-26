/* eslint-disable react/destructuring-assignment, react/static-property-placement */
import React, { Component, ErrorInfo, PropsWithChildren } from 'react';

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
        // Show a recovery UI instead of a blank screen.
        fallback: (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    fontFamily: 'sans-serif',
                    color: '#333',
                }}
            >
                <h2>Something went wrong</h2>
                <p>An unexpected error occurred. Please reload the app.</p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: '16px',
                        padding: '8px 24px',
                        fontSize: '14px',
                        cursor: 'pointer',
                    }}
                >
                    Reload
                </button>
            </div>
        ),
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
