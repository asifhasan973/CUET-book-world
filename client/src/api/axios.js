import axios from 'axios';
import { auth } from '../firebase';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// Attach Firebase ID Token (JWT) to every request dynamically
API.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Error fetching Firebase ID token:', error);
    }
  }
  return config;
});

export default API;
