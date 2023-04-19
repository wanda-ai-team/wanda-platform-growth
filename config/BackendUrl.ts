declare const process: any;

function getBackendUrlHost() {
  const defaultUrl = 'http://localhost:3000';
  const envUrl = process?.env?.BACKEND_URL || '';
  if (typeof window !== 'undefined') {
    // Perform localStorage action
    const localStorageUrl = localStorage.getItem('backendUrl') || '';
    const urlParam = new URLSearchParams(window.location.search).get('api') || '';
    const result = urlParam || localStorageUrl || envUrl || defaultUrl;
    const resultWithoutTrailingSlash = result.replace(/\/$/, '');
    return resultWithoutTrailingSlash;
  }
  return envUrl.replace(/\/$/, '') || defaultUrl.replace(/\/$/, '');
}

export function getBackendApiUrl() {
  return getBackendUrlHost();
}

export function getBackendSocketUrl() {
  return getBackendUrlHost().replace(/^http/, 'ws');
}
