
import { STORAGE_KEYS } from '../constants';

export const getStorage = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

export const setStorage = <T,>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const formatCurrency = (value: any) => {
  const num = Number(value);
  if (isNaN(num)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '---';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const getMonthName = (monthString: string) => {
  if (!monthString) return '---';
  const [year, month] = monthString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
