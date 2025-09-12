'use client';

import { BACKEND_URL } from '@/config';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
};

/**
 * Centralized API service for making requests to the backend
 * 
 * This helps avoid duplicate API call implementations across components
 */
export const apiService = {
  /**
   * Make an API request
   */
  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requiresAuth = true,
    } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include', 
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, config);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  auth: {
    login: (email: string) => 
      apiService.request('/api/v1/signin', {
        method: 'POST',
        body: { email },
        requiresAuth: false,
      }),
    
    register: (email: string) => 
      apiService.request('/api/v1/signup', {
        method: 'POST',
        body: { email },
        requiresAuth: false,
      }),
    
    logout: () => 
      apiService.request('/api/v1/auth/logout'),
  },

  market: {
    getKlines: (asset: string, interval: string) => 
      apiService.request(`/api/v1/klines?asset=${asset}&interval=${interval}`, {
        requiresAuth: false,
      }),
    
    getAssets: () => 
      apiService.request('/api/v1/assets', {
        requiresAuth: false, 
      }),
  },

  trading: {    
    closePosition: (orderId: string) => 
      apiService.request('/api/v1/trade/close', {
        method: 'POST',
        body: { orderId },
      }),
    
    
    getHistory: (filters?: {
      status?: 'open' | 'closed',
      asset?: string,
      tradeType?: 'long' | 'short',
      profitable?: boolean,
      liquidated?: boolean,
      fromDate?: string,
      toDate?: string,
      limit?: number,
      offset?: number,
      sortBy?: string,
      cacheOnly?:boolean,
      sortOrder?: 'asc' | 'desc'
    }) => {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, String(value));
          }
        });
      }
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return apiService.request(`/api/v1/trade/history${queryString}`);
    },
  },

  balance: {
    getBalance: () => 
      apiService.request('/api/v1/balance'),
  },
};
