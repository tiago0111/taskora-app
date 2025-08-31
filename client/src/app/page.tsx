'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Home() {
  const [userEmail, setUserEmail] = useState("")
  const [userPassword, setUserPassword] = useState("")
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Estrutura 'try...catch...finally' 
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: userEmail, password: userPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        // Usa a mensagem de erro da API, se existir, ou uma mensagem padrão
        throw new Error(data.error || "Ocorreu um erro ao fazer login.");
      }
      
      if (data.token) {
        Cookies.set('authToken', data.token, { expires: 7 }); // Guarda o token num cookie por 7 dias
        router.push('/dashboard/tasks');
      } else {
        throw new Error("Token não recebido do servidor.");
      }

    } catch (err) {
      // Corrigido: Verifica se 'err' é uma instância de Error antes de usar .message
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  } 
  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center p-4">

        {/* Auth Container */}
        <div className="w-full flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="text-center mb-8">
              {/* <div className="inline-flex items-center justify-center w-48 h-32 bg-slate-700 rounded-2xl mb-6 shadow-2xl border border-slate-600 overflow-hidden"> */}
                <Image
                  src="/logo.png"
                  alt="Taskora Logo"
                  width={160}
                  height={100}
                  className="object-contain items-center justify-center inline-flex"
                />
              {/* </div> */}
              <p className="text-slate-300 text-lg font-medium">Aceda à sua conta</p>
            </div>

            {/* Auth Card */}
            <div className="bg-white rounded-3xl p-10 shadow-2xl">
              {/* Login Form */}
                <form  onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Email Empresarial
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-lg"
                        placeholder="seu@empresa.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <i className="bx bx-envelope text-slate-400 text-xl"></i>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Palavra-passe
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-lg"
                        placeholder="••••••••••"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <i className="bx bx-lock-alt text-slate-400 text-xl"></i>
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-400 text-center">{error}</p>}


                  {/* <Link href="/dashboard"> */}
                    <button
                      type="submit"
                      className="w-full py-4 px-6 bg-slate-800 text-white rounded-xl font-bold text-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transform hover:scale-[1.02] transition-all duration-200 shadow-xl hover:shadow-2xl"
                      disabled={isLoading}
                    >
                      <span className="flex items-center justify-center">
                        <i className="bx bx-log-in mr-3 text-xl"></i>
                        Entrar na Plataforma
                      </span>
                    </button>
                  {/* </Link> */}
                </form>
            </div>
          </div>
        </div>
    </div>
  );
}