import { createContext } from "react";

const funcContext = createContext<{
    setLoading: (loading: boolean) => void;
    reloadUserData: () => Promise<void>;
}>({
    setLoading: () => { },
    reloadUserData: async () => { },
});

export default funcContext;
