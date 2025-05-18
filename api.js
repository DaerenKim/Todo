import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // adjust if your FastAPI is on a different port
});

export default api;
