'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [userEmail, setUserEmail] = useState("")
  const [userPassword, setUserPassword] = useState("")
  const router = useRouter();

  // 2. Função para lidar com a submissão do formulário
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Evita que a página recarregue
    
    // Por agora, apenas mostramos os dados na consola para testar
    console.log('Dados de Login:', { userEmail, userPassword });
     router.push('/dashboard'); 
    // Futuramente, aqui será a chamada para a API do backend
  };

 

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





                  {/* <Link href="/dashboard"> */}
                    <button
                      type="submit"
                      className="w-full py-4 px-6 bg-slate-800 text-white rounded-xl font-bold text-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transform hover:scale-[1.02] transition-all duration-200 shadow-xl hover:shadow-2xl"
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
