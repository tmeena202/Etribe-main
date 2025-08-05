// Utility function to get API headers from environment variables
export const getApiHeaders = () => {
  return {
    'Client-Service': import.meta.env.VITE_CLIENT_SERVICE,
    'Auth-Key': import.meta.env.VITE_AUTH_KEY,
    'rurl': import.meta.env.VITE_RURL,
    'Content-Type': 'application/json',
  };
};

// Utility function to get API headers with user authentication
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const uid = localStorage.getItem('uid');
  
  return {
    'Client-Service': import.meta.env.VITE_CLIENT_SERVICE,
    'Auth-Key': import.meta.env.VITE_AUTH_KEY,
    'uid': uid,
    'token': token,
    'rurl': import.meta.env.VITE_RURL,
    'Content-Type': 'application/json',
  };
}; 