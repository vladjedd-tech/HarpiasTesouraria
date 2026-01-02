
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { STORAGE_KEYS } from '../constants';
import { getStorage, setStorage } from '../utils/helpers';
import { supabase, isCloudEnabled } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  login: (apelido: string, senha: string) => Promise<boolean>;
  logout: () => void;
  updatePassword: (newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedAuth = getStorage<User | null>(STORAGE_KEYS.AUTH, null);
      if (savedAuth && isCloudEnabled) {
        try {
          const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('id', savedAuth.id)
            .single();
          
          if (data && !error && data.status === 'ATIVO') {
            const mappedUser: User = {
              ...data,
              requiresPasswordChange: data.requires_password_change
            };
            setUser(mappedUser);
          } else {
            logout();
          }
        } catch (e: any) {
          console.error("Erro ao validar sessão:", e.message || e);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (apelido: string, senha: string): Promise<boolean> => {
    if (!isCloudEnabled) return false;

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .ilike('apelido', apelido.trim())
        .eq('senha', senha.trim())
        .eq('status', 'ATIVO')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const loggedUser: User = {
          ...data,
          requiresPasswordChange: data.requires_password_change
        };
        setUser(loggedUser);
        setStorage(STORAGE_KEYS.AUTH, loggedUser);
        return true;
      }
      return false;
    } catch (e: any) {
      console.error("Erro no login:", e.message || e);
      throw e;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  };

  const updatePassword = async (newPassword: string) => {
    if (!user || !isCloudEnabled) return;
    
    try {
      const { error } = await supabase
        .from('members')
        .update({ 
          senha: newPassword.trim(), 
          requires_password_change: false 
        })
        .eq('id', user.id);
      
      if (error) throw new Error(error.message);

      const updatedUser = { ...user, senha: newPassword.trim(), requiresPasswordChange: false };
      setUser(updatedUser);
      setStorage(STORAGE_KEYS.AUTH, updatedUser);
    } catch (e: any) {
      console.error("Erro ao atualizar senha:", e.message || e);
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updatePassword, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
