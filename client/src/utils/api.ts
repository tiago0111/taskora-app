import Cookies from 'js-cookie';

const BASE_URL = 'http://localhost:3001/api';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = Cookies.get('authToken');

  if (!token) {
    window.location.href = '/';
    return new Response(JSON.stringify({ message: 'Não autorizado.' }), { status: 401 });
  }

  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    Cookies.remove('authToken');
    window.location.href = '/';
  }

  return response;
}