'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { fetchWithAuth } from '@/utils/api';
import type { User } from '@/types'; // Importar o tipo User atualizado

// --- Componente da Página Principal ---
export default function AdminSettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para controlar o modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth('/users');
      if (!response.ok) {
        if (response.status === 403) throw new Error('Acesso negado. Apenas administradores podem ver esta página.');
        throw new Error('Falha ao carregar os utilizadores.');
      }
      const data: User[] = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenModalForCreate = () => {
    setEditingUser(null); // Garante que é para criar um novo
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  // Função que é chamada pelo modal para guardar as alterações
  const handleSave = () => {
    fetchUsers(); // Simplesmente recarrega a lista de utilizadores
    setIsModalOpen(false); // Fecha o modal
  };

  if (isLoading) {
    return <p className="text-center text-slate-400">A carregar...</p>;
  }
  
  if (error) {
    return <p className="text-center text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Utilizadores</h1>
          <p className="text-slate-400 mt-1">Adicione, veja e edite os utilizadores da plataforma.</p>
        </div>
        <button onClick={handleOpenModalForCreate} className="btn-primary">
          <i className="bx bx-plus mr-2"></i>
          Adicionar Utilizador
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-slate-300">Nome</th>
              <th className="p-4 text-sm font-semibold text-slate-300">Email</th>
              <th className="p-4 text-sm font-semibold text-slate-300">Perfil</th>
              <th className="p-4 text-sm font-semibold text-slate-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50">
                <td className="p-4 text-white font-medium">{user.name}</td>
                <td className="p-4 text-slate-400">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => handleOpenModalForEdit(user)} className="text-slate-400 hover:text-white">
                    <i className="bx bx-edit text-xl"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && (
        <UserModal 
          user={editingUser}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}


// --- Componente do Modal ---
interface UserModalProps {
  user: User | null;
  onClose: () => void;
  onSave: () => void;
}

function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'USER',
    bio: user?.bio || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = user !== null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditing ? `/users/${user.id}` : '/users';
      const method = isEditing ? 'PUT' : 'POST';

      const body = isEditing 
        ? { name: formData.name, bio: formData.bio, role: formData.role }
        : { name: formData.name, email: formData.email, password: formData.password, role: formData.role };
      
      const response = await fetchWithAuth(url, {
        method: method,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Falha ao ${isEditing ? 'atualizar' : 'criar'} utilizador.`);
      }

      onSave();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{isEditing ? 'Editar Utilizador' : 'Adicionar Novo Utilizador'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><i className="bx bx-x text-2xl"></i></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input type="text" name="name" placeholder="Nome Completo" value={formData.name} onChange={handleChange} className="input-field" disabled={isLoading} />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="input-field" disabled={isLoading || isEditing} />
          {!isEditing && (
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="input-field" disabled={isLoading} />
          )}
          <textarea name="bio" placeholder="Biografia (opcional)" rows={3} value={formData.bio} onChange={handleChange} className="input-field" disabled={isLoading} />
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Perfil</label>
            <select name="role" value={formData.role} onChange={handleChange} className="input-field" disabled={isLoading}>
              <option value="USER">Utilizador</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'A guardar...' : 'Guardar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}