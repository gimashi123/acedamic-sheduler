/**
 * Get the authorization header with JWT token
 */

// Get the authentication token from local storage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

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