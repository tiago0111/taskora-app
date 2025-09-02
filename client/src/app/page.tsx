
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { fetchWithAuth } from '@/utils/api'; 
import toast from 'react-hot-toast'; // Usar toasts para feedback é uma boa prática

export default function Home() {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!userEmail || !userPassword) {
      toast.error('Por favor, preencha o email e a palavra-passe.');
      return;
    }
    setIsLoading(true);

    const promise = fetch('http://taskora-alb-1889420350.eu-north-1.elb.amazonaws.com/api/auth/login', { // Usar o URL público do ALB
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: userEmail, password: userPassword })
    })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Credenciais inválidas.");
      }
      return data;
    });

    toast.promise(promise, {
      loading: 'A iniciar sessão...',
      success: (data) => {
        if (data.token) {
          Cookies.set('authToken', data.token, { expires: 7 });
          router.push('/dashboard');
          return 'Login bem-sucedido!';
        }
        throw new Error("Token não recebido do servidor.");
      },
      error: (err) => err.message,
    }).finally(() => {
      setIsLoading(false);
    });
  }

  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center p-4">
      <div className="w-full flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image
              src="/logo.png"
              alt="Taskora Logo"
              width={160}
              height={100}
              className="object-contain items-center justify-center inline-flex"
            />
            <p className="text-slate-300 text-lg font-medium">Aceda à sua conta</p>
          </div>
          <div className="bg-white rounded-3xl p-10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <i className="bx bx-lock-alt text-slate-400 text-xl"></i>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 px-6 bg-slate-800 text-white rounded-xl font-bold text-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transform hover:scale-[1.02] transition-all duration-200 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <span className="flex items-center justify-center">
                  {isLoading ? (
                    <i className="bx bx-loader-alt animate-spin text-xl"></i>
                  ) : (
                    <>
                      <i className="bx bx-log-in mr-3 text-xl"></i>
                      Entrar na Plataforma
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}