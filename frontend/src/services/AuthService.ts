/**
 * Authentication service functions
 */

// Get the authentication token from local storage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Get authorization header with token
export const getAuthHeader = () => {
  const token = getAuthToken();
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
  };
};

// Store authentication tokens
export const storeTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

// Remove authentication tokens
export const removeTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
}; 