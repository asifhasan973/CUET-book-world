import axios from 'axios';
import { auth } from '../firebase';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// Attach Firebase UID to every request
API.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    config.headers['x-firebase-uid'] = user.uid;
  }
  return config;
});

export default API;
