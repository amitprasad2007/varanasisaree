
import './bootstrap';
import '../css/app.css';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        console.log(`[Inertia] Resolving page: ${name}`);
        return resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob<any>('./Pages/**/*.tsx')) as any;
    },
    setup({ el, App, props }) {
        console.log('[Inertia] In setup function');
        console.log('[Inertia] Element ID:', el?.id);
        console.log('[Inertia] Props InitialPage:', props?.initialPage ? 'Found' : 'Missing');
        
        if (!props || !props.initialPage) {
            console.error('[Inertia] Critical Error: Initial page data (props) is missing or null.');
            console.error('[Inertia] Raw data-page attribute from div#app:', el?.dataset?.page);
            console.error('[Inertia] Current URL:', window.location.href);
            // We still proceed or try to render a fallback, but the error usually happens in Inertia's internal code anyway
        }

        if (el.hasChildNodes()) {
            console.log('[Inertia] Hydrating on existing child nodes (SSR Mode)');
            hydrateRoot(el, <App {...props} />);
        } else {
            console.log('[Inertia] Creating new root (CSR Mode)');
            createRoot(el).render(<App {...props} />);
        }
    },
    progress: {
        color: '#8989DE',
    },
});
