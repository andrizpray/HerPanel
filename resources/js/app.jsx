import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import React from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'HerPanel';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('React Error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'white', backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                    <h1 style={{ color: '#ef4444' }}>⚠️ Application Error</h1>
                    <pre style={{ backgroundColor: '#000', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
                        {this.state.error?.toString()}
                    </pre>
                    {this.state.errorInfo && (
                        <>
                            <h3>Component Stack:</h3>
                            <pre style={{ backgroundColor: '#000', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </>
                    )}
                    <button 
                        onClick={() => window.location.reload()} 
                        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        console.log('Loading page component:', name);
        return resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ).catch((err) => {
            console.error('Failed to load component:', name, err);
            throw err;
        });
    },
    setup({ el, App, props }) {
        console.log('Inertia App mounting...', props);
        const root = createRoot(el);

        try {
            root.render(
                <ErrorBoundary>
                    <App {...props} />
                </ErrorBoundary>
            );
            console.log('Inertia App mounted successfully!');
        } catch (err) {
            console.error('Failed to render Inertia App:', err);
        }
    },
    progress: {
        color: '#4B5563',
    },
});
