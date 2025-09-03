import _axios from 'axios';

export const baseURL = import.meta.env.VITE_API_BASE_URL;

const options = {
  baseURL: `${baseURL}/api/v1`,
  withCredentials: true,
  timeout: 10000,
};

export const axios = _axios.create(options);
