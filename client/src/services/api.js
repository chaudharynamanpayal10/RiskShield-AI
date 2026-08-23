import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export const analyzeTransaction = async (transactionData) => {
  const response = await API.post(
    "/transactions",
    transactionData
  );

  return response.data;
};

export const getTransactions = async () => {
  const response = await API.get("/transactions");

  return response.data;
};

export default API;