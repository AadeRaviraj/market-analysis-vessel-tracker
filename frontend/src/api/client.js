import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

const client = axios.create({ baseURL: BASE_URL });

// attach token to every request, if we have one
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("ma_token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const login = (username, password) =>
  client.post("/auth/login/", { username, password }).then((r) => r.data);

export const whoami = () => client.get("/auth/whoami/").then((r) => r.data);

export const getRegions = () => client.get("/regions/").then((r) => r.data);

export const getVessels = () => client.get("/vessels/").then((r) => r.data);

export const getEntries = (params = {}) =>
  client.get("/entries/", { params }).then((r) => r.data);

export const createEntry = (payload) =>
  client.post("/entries/", payload).then((r) => r.data);

export const getAggregated = (params = {}) =>
  client.get("/entries/aggregated/", { params }).then((r) => r.data);

export default client;
