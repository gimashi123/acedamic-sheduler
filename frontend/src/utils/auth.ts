/**
 * Get the authorization header with JWT token
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
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