import axios from "axios";

export const AuthAPI = {
  login(data: { email: string; password: string }) {
    return axios.post("/api/auth/login", data);
  },

  me() {
    return axios.get("/api/auth/me");
  },
};
