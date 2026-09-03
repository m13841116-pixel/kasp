export async function getCsrfToken(): Promise<string> {
  try {
    const res = await fetch('/api/auth/csrf');
    if (res.ok) {
      const data = await res.json();
      if (data.csrfToken) {
        localStorage.setItem('csrf_token', data.csrfToken);
        return data.csrfToken;
      }
    }
  } catch (err) {
    console.error('Error fetching CSRF token:', err);
  }
  return '';
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  let modifiedInit = init || {};

  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    ...(modifiedInit.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    let csrfToken = localStorage.getItem('csrf_token');
    if (!csrfToken) {
      csrfToken = await getCsrfToken();
    }
    headers['x-csrf-token'] = csrfToken || '';
  }

  modifiedInit = {
    ...modifiedInit,
    headers
  };

  const response = await fetch(input, modifiedInit);

  if (
    response.status === 401 && 
    !input.toString().includes('/auth/check') &&
    !input.toString().includes('/admin-login') &&
    !input.toString().includes('/auth/login')
  ) {
    window.dispatchEvent(new CustomEvent('app:unauthorized'));
  }

  return response;
}
