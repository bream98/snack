const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const resData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      resData.message || resData.error || `HTTP ${response.status}: Yêu cầu thất bại`;
    throw new Error(errorMsg);
  }

  return resData.data !== undefined ? resData.data : resData;
}
