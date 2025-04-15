import type { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;
}

interface FormOptions {
    onSuccess?: (page: any) => void;
    onError?: (errors: any) => void;
    onFinish?: () => void;
    onCancelToken?: (cancelToken: any) => void;
    onCancel?: () => void;
    onBefore?: () => void;
    onStart?: () => void;
    onProgress?: (progress: any) => void;
    preserveScroll?: boolean;
    preserveState?: boolean;
    resetOnSuccess?: boolean;
    forceFormData?: boolean;
  }