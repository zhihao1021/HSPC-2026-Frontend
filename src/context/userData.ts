import type { UserDataRead } from "@/model/user";
import { createContext } from "react";

const userDataContext = createContext<null | undefined | UserDataRead>(undefined);

export default userDataContext;
