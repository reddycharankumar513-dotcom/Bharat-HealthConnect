// Bharat HealthConnect Frontend API Client

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

const getHeaders = (isFormData = false): HeadersInit => {
  const token = localStorage.getItem('bhc_auth_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const api = {
  get: async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: error.message || 'Network request failed.' };
    }
  },

  post: async <T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
    try {
      const isFormData = body instanceof FormData;
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(isFormData),
        body: isFormData ? body : JSON.stringify(body)
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: error.message || 'Network request failed.' };
    }
  },

  put: async <T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> => {
    try {
      const isFormData = body instanceof FormData;
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(isFormData),
        body: isFormData ? body : (body ? JSON.stringify(body) : undefined)
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: error.message || 'Network request failed.' };
    }
  },

  delete: async <T = any>(endpoint: string): Promise<ApiResponse<T>> => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: error.message || 'Network request failed.' };
    }
  }
};

export default api;
