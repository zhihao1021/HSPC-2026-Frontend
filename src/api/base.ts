import axios from "axios";

const req = axios.create({
    baseURL: import.meta.env.VITE_API_ENDPOINT,
})

req.interceptors.request.use(config => {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type");
    if (token && tokenType) {
        config.headers["Authorization"] = `${tokenType} ${token}`;
    }

    return config;
})

export default req;
