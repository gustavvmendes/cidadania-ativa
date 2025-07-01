import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

export const apiRequest = async (endpoint: string, method: string, data?: any) => {
  const token = await AsyncStorage.getItem('userToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Erro na requisição');
  }

  return responseData;
};


