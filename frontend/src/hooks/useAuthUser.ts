import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false
  });

  const user = authUser.data?.user ?? null;
  const isAuthenticated = !!user;
  const isOnboarded = user?.isOnboarded ?? false;
  
  return {
    isLoading: authUser.isLoading,
    isError: authUser.isError,
    user,
    isAuthenticated,
    isOnboarded // Now properly included in the return type
  };
};

export default useAuthUser;