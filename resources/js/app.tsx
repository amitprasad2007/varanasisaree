
import './bootstrap';
import '../css/app.css';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

// Very early diagnostic
(function() {
    const el = document.getElementById('app');
    console.log('[DEBUG] Root element "app":', el ? 'Present' : 'MISSING');
    if (el) {
        console.log('[DEBUG] Root element contains data-page:', el.dataset.page ? 'YES' : 'NO');
        if (el.dataset.page) {
            try {
                const page = JSON.parse(el.dataset.page);
                console.log('[DEBUG] Page name:', page.component);
                console.log('[DEBUG] Page URL:', page.url);
            } catch (e) {
                console.error('[DEBUG] Failed to parse data-page JSON:', e instanceof Error ? e.message : e);
            }
        }
    }
})();

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        console.log(`[DEBUG] Resolving component: ${name}`);
        return resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob<any>('./Pages/**/*.tsx')) as any;
    },
    setup({ el, App, props }) {
        console.log('[DEBUG] In setup function');
        
        if (!props || !props.initialPage) {
            console.error('[DEBUG] NO INITIAL PAGE PROPS IN SETUP');
        }

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
