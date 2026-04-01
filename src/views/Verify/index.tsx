import { useContext, useEffect, useState, type ReactNode } from "react";

import styles from "./index.module.scss";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { verifyEmail } from "@/api/auth";
import funcContext from "@/context/func";

export default function Verify(): ReactNode {
    const { reloadUserData } = useContext(funcContext);

    const [status, setStatus] = useState<"verifying" | "success" | "error">("error");
    const [countdown, setCountdown] = useState<number>(3);

    const { search } = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(search);
    const code = searchParams.get("code") || undefined;

    useEffect(() => {
        if (code === undefined) return;

        setStatus("verifying");
        verifyEmail(code).then((data) => {
            localStorage.setItem("token_type", data.token_type);
            localStorage.setItem("access_token", data.access_token);

            reloadUserData().then(() => {
                setStatus("success");
                setTimeout(() => setCountdown(v => v - 1), 1000);
                setTimeout(() => setCountdown(v => v - 1), 2000);
                setTimeout(() => setCountdown(v => v - 1), 3000);
                setTimeout(() => navigate("/profile", { replace: true }), 3000);
            });
        }).catch(() => setStatus("error"));
    }, [code]);

    if (code === undefined) return <Navigate to="/" />

    return <div className={styles.verify}>
        {
            status === "verifying" ? <>
                <h2>驗證中...</h2>
                <div className={styles.loading}>{
                    Array.from({ length: 5 }).map((_, i) => <div
                        key={i}
                        className={styles.strip}
                        style={{ animationDelay: `${i / 8}s` }}
                    />)
                }</div>
            </> : status === "success" ? <>
                <h2>驗證成功！</h2>
                <h2>{`將於 ${countdown} 秒後自動跳轉...`}</h2>
            </> :
                status === "error" ? <div>
                    <h2>驗證失敗！</h2>
                    <p className={styles.error}>請確認驗證連結是否正確，或重新申請驗證信。</p>
                </div> : <Navigate to="/" />
        }
    </div>
}