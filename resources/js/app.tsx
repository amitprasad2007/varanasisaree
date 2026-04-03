import './bootstrap';
import '../css/app.css';
import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent<ResolvedComponent>(
            `./Pages/${name}.tsx`,
            import.meta.glob<ResolvedComponent>('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        if (el?.hasChildNodes()) {
            hydrateRoot(el, <App {...props} />);
        } else if (el) {
            createRoot(el).render(<App {...props} />);
        }
    },
    progress: {
        color: '#8989DE',
    },
});
