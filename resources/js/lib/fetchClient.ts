/**
 * A drop-in replacement for basic axios functionality utilizing the native fetch API.
 * This ensures that custom API calls behave like they did with Axios, but without the dependency.
 */

// Helper to construct query strings from an object
const buildParams = (params?: Record<string, any>) => {
    if (!params) return '';
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
};

// Retrieve the CSRF token from Laravel's encrypted XSRF-TOKEN cookie
const getXsrfToken = () => {
    const match = document.cookie.match(new RegExp('(^|;\\s*)(XSRF-TOKEN)=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : '';
};

// Standard fetch wrapper
const fetchRequest = async (method: string, url: string, data?: any, config?: any) => {
    const fullUrl = url + buildParams(config?.params);
    let body = undefined;
    let contentType = 'application/json';

    if (data instanceof FormData) {
        body = data;
        // Let the browser set the multi-part boundary content type
        contentType = '';
    } else if (data) {
        body = JSON.stringify(data);
    }

    const headers: HeadersInit = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...config?.headers,
    };

    // Laravel requires the X-XSRF-TOKEN header to match the cookie
    const xsrfToken = getXsrfToken();
    if (xsrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
        (headers as Record<string, string>)['X-XSRF-TOKEN'] = xsrfToken;
    }

    if (contentType) {
        (headers as Record<string, string>)['Content-Type'] = contentType;
    }

    try {
        const response = await fetch(fullUrl, {
            method,
            headers,
            body,
            credentials: 'same-origin', // Ensure cookies are sent
        });

        // Parse JSON response if present
        let responseData = null;
        const contentTypeHeader = response.headers.get('content-type');
        if (contentTypeHeader && contentTypeHeader.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
            // Try to parse it manually if the server didn't set application/json but returned JSON anyway
            try {
                if (responseData) responseData = JSON.parse(responseData);
            } catch (e) {
                // Ignore parsing error, it's just raw text
            }
        }

        if (!response.ok) {
            const error: any = new Error(response.statusText);
            error.response = {
                status: response.status,
                data: responseData,
                statusText: response.statusText,
                headers: response.headers,
            };
            throw error;
        }

        return {
            data: responseData,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        };
    } catch (error) {
        throw error;
    }
};

const fetchClient = {
    get: (url: string, config?: any) => fetchRequest('GET', url, undefined, config),
    post: (url: string, data?: any, config?: any) => fetchRequest('POST', url, data, config),
    put: (url: string, data?: any, config?: any) => fetchRequest('PUT', url, data, config),
    patch: (url: string, data?: any, config?: any) => fetchRequest('PATCH', url, data, config),
    delete: (url: string, config?: any) => fetchRequest('DELETE', url, undefined, config),
};

export default fetchClient;
