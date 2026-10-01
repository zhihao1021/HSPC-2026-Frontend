import { useEffect, useState, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import { refreshToken } from "./api/auth";
import { getUserData } from "./api/user";

import Loading from "./components/Loading";
import TopBar from "./components/TopBar";

import funcContext from "./context/func";
import userDataContext from "./context/userData";

import type { UserDataRead } from "./model/user";

import Home from "./views/Home";
import Login from "./views/Login";
import Settings from "./views/Settings";
import Verify from "./views/Verify";
import Manage from "./views/Manage";
import HistoryPage from "./views/History";

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

            const token = localStorage.getItem("access_token")!;
            const jwtData = jwtDecode(token) as Readonly<{ exp: number }>;
            const exp = jwtData.exp * 1000;
            const now = Date.now();
            if (exp - now < 24 * 60 * 1000) {
                return refreshToken();
            }
        }).then((data) => {
            if (data) {
                localStorage.setItem("token_type", data.token_type);
                localStorage.setItem("access_token", data.access_token);
            }
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
                <Route path="/profile/*" element={<Settings />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/manage" element={<Manage />} />
                <Route path="/history" element={<HistoryPage />} />
            </Routes>
        </ funcContext.Provider>
    </userDataContext.Provider >;
}