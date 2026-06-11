import axios from "axios";

const api = axios.create({
  baseURL: "https://judgelens.onrender.com",
});

export default api;