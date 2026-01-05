import { useQuery } from "@tanstack/react-query";

const useAllServices = () => {
    const { data: services = [], isLoading, error, refetch } = useQuery({
        queryKey: ["all-services"],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/service`);
            const data = await res.json();
            return data.Data;
        },
    });

    return [services, isLoading, refetch, error];
};

export default useAllServices;