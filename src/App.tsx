import { useEffect, useState, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";

import Loading from "./components/Loading";
import TopBar from "./components/TopBar";
import funcContext from "./context/func";
import userDataContext from "./context/userData";
import type { UserDataRead } from "./model/user";
import Home from "./views/Home";
import Login from "./views/Login";
import { getUserData } from "./api/user";
import Profile from "./views/Profile";
import Verify from "./views/Verify";

export default function App(): ReactNode {
    const [userData, setUserData] = useState<null | UserDataRead>();
    const [showLoading, setShowLoading] = useState<number>(1);

    const setLoading = (loading: boolean) => {
        setShowLoading((prev) => Math.max(prev + (loading ? 1 : -1), 0));
    }

    const reloadUserData = async () => {
        setLoading(true);
        return getUserData().then((data) => {
            setUserData(data);
        }).finally(() => {
            setLoading(false);
        });
    }

    useEffect(() => {
        reloadUserData();
        setLoading(false);
    }, []);

    return <userDataContext.Provider value={userData}>
        <funcContext.Provider value={{
            setLoading: setLoading,
            reloadUserData: reloadUserData,
        }}>
            <Loading show={showLoading > 0} />
            <TopBar />
            <Routes>
                <Route path="/*" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile/*" element={<Profile />} />
                <Route path="/verify" element={<Verify />} />
            </Routes>
        </ funcContext.Provider>
    </userDataContext.Provider >;
}