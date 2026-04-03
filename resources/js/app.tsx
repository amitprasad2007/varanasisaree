import './bootstrap';
import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot, hydrateRoot } from 'react-dom/client';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

const pages = import.meta.glob('./Pages/**/*.tsx');

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const path = `./Pages/${name}.tsx`;
        const importFn = pages[path];
        if (!importFn) {
            throw new Error(
                `Page not found: ${name}. Tried: ${path}. Available: ${Object.keys(pages).slice(0, 10).join(', ')}...`,
            );
        }
        return importFn();
    },
    setup({ el, App, props }) {
        if (!el) throw new Error('Missing Inertia mount element.');

        if (el.hasChildNodes()) {
            hydrateRoot(el, <App {...props} />);
        } else {
            createRoot(el).render(<App {...props} />);
        }
    },
    progress: {
        color: '#8989DE',
    },
});
