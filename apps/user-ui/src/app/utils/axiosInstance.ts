import axios from "axios";
import { error } from "console";
import { config } from "process";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});


let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const handleLogout = () => {
     if(window.location.pathname !== "/login") {
        window.location.href = "/login";
     }
};


const subscribeTokenRefresh = (callback: () => void) => {
    refreshSubscribers.push(callback);
}


const onRefreshSuccess = () => {
    refreshSubscribers.forEach((callback) => callback());
    refreshSubscribers = [];
}


axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
)


axiosInstance.interceptors.response.use(
    (response) => response, async (error) => {
        const originalRequest = error.config;

        if(error.response?.status === 401 && !originalRequest._retry){
            if(isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/refresh-token-user`, {}, { withCredentials: true });
                 
                isRefreshing = false;
                onRefreshSuccess();

                return axiosInstance(originalRequest);

            } catch (error) {
                isRefreshing = false;
                onRefreshSuccess();
                handleLogout();
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
)

export default axiosInstance;