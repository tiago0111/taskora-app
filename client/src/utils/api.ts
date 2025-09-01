import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = Cookies.get('authToken');

  if (!token && typeof window !== 'undefined') {
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

  if ((response.status === 401 || response.status === 403) && typeof window !== 'undefined') {
    Cookies.remove('authToken');
    window.location.href = '/';
  }

  return response;
}