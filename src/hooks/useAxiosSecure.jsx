import axios from "axios";
import useAuth from "./useAuth";


const axiosSecure = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_API_URL}`
})

const useAxiosSecure = () => {
    const { logOut } = useAuth();

    axiosSecure.interceptors.request.use(function (config) {
        const token = localStorage.getItem('access-token');
        config.headers.authorization = `${token}`;
        return config;
    }, function (err) {
        return Promise.reject(err);
    })

    axiosSecure.interceptors.response.use(function (res) {
        return res;
    }, async err => {
        const status = err.response.status;
        if (status === 401 || status === 403) {
            await logOut();
        }
    })
    return axiosSecure;
};

export default useAxiosSecure;