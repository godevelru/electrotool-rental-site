
import axios from 'axios';

// Базовая конфигурация для API запросов
const api = axios.create({
  baseURL: 'https://api.instrumentprokat.ru/api/v1', // Замените на реальный API базовый URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена в заголовки
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обработка 401 ошибки - редирект на страницу логина
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API методы для работы с продуктами
export const productsApi = {
  // Получение всех продуктов с поддержкой пагинации, поиска и фильтрации
  getProducts: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    available?: boolean;
  }) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Получение одного продукта по ID
  getProductById: async (id: number | string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Получение категорий продуктов
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
};

// API методы для аутентификации
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('auth_token', response.data.token);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }
};

// API методы для бронирования
export const bookingsApi = {
  createBooking: async (bookingData: {
    productIds: number[];
    startDate: string;
    endDate: string;
    deliveryMethod: string;
    address?: string;
    comment?: string;
  }) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  getUserBookings: async () => {
    try {
      const response = await api.get('/bookings/my');
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  getBookingById: async (id: number | string) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking ${id}:`, error);
      throw error;
    }
  },

  cancelBooking: async (id: number | string) => {
    try {
      const response = await api.post(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Error canceling booking ${id}:`, error);
      throw error;
    }
  }
};

// Новый API для административных функций
export const adminApi = {
  // Управление пользователями
  users: {
    getUsers: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      role?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      try {
        const response = await api.get('/admin/users', { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },

    getUserById: async (id: string) => {
      try {
        const response = await api.get(`/admin/users/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching user ${id}:`, error);
        throw error;
      }
    },

    createUser: async (userData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
      role: string;
      status: string;
    }) => {
      try {
        const response = await api.post('/admin/users', userData);
        return response.data;
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    },

    updateUser: async (id: string, userData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      role?: string;
      status?: string;
      password?: string;
    }) => {
      try {
        const response = await api.put(`/admin/users/${id}`, userData);
        return response.data;
      } catch (error) {
        console.error(`Error updating user ${id}:`, error);
        throw error;
      }
    },

    deleteUser: async (id: string) => {
      try {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        throw error;
      }
    },

    changeUserRole: async (id: string, role: string) => {
      try {
        const response = await api.patch(`/admin/users/${id}/role`, { role });
        return response.data;
      } catch (error) {
        console.error(`Error changing role for user ${id}:`, error);
        throw error;
      }
    },

    changeUserStatus: async (id: string, status: string) => {
      try {
        const response = await api.patch(`/admin/users/${id}/status`, { status });
        return response.data;
      } catch (error) {
        console.error(`Error changing status for user ${id}:`, error);
        throw error;
      }
    }
  },

  // Управление инструментами (заготовка для будущей реализации)
  tools: {
    getTools: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      try {
        const response = await api.get('/admin/tools', { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching tools:', error);
        throw error;
      }
    },
    
    // Остальные методы для инструментов будут добавлены позже
  },

  // Управление бронированиями (заготовка для будущей реализации)
  bookings: {
    getBookings: async (params?: {
      page?: number;
      limit?: number;
      status?: string;
      startDate?: string;
      endDate?: string;
      userId?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      try {
        const response = await api.get('/admin/bookings', { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }
    },
    
    // Остальные методы для бронирований будут добавлены позже
  },

  // Статистика и аналитика
  dashboard: {
    getSummary: async () => {
      try {
        const response = await api.get('/admin/dashboard/summary');
        return response.data;
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        throw error;
      }
    },

    getRevenueStats: async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
      try {
        const response = await api.get('/admin/dashboard/revenue', { params: { period } });
        return response.data;
      } catch (error) {
        console.error('Error fetching revenue stats:', error);
        throw error;
      }
    },

    getBookingStats: async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
      try {
        const response = await api.get('/admin/dashboard/bookings', { params: { period } });
        return response.data;
      } catch (error) {
        console.error('Error fetching booking stats:', error);
        throw error;
      }
    }
  }
};
