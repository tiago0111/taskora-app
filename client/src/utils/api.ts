import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

export async function api(endpoint: string, options: ApiOptions = {}) {
  const { auth = false, ...fetchOptions } = options;
  
  // CORREÇÃO: Criamos um novo objeto Headers para garantir a compatibilidade de tipos.
  const headers = new Headers(fetchOptions.headers);
  headers.set('Content-Type', 'application/json');

  if (auth) {
    const token = Cookies.get('authToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.error('Tentativa de chamada autenticada sem token.');
      return new Response(JSON.stringify({ message: 'Não autorizado.' }), { status: 401 });
    }
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('authToken');
      window.location.href = '/';
      return response;
    }

    return response;
  } catch (error) {
    console.error('Erro de rede ao fazer fetch:', error);
    return new Response(JSON.stringify({ message: 'Erro de rede ou API indisponível.' }), { status: 503 });
  }
}