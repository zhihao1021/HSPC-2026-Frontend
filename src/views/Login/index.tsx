import { AxiosError } from "axios";
import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

import { login, register } from "@/api/auth";
import funcContext from "@/context/func";
import userDataContext from "@/context/userData";
import { validateEmail } from "@/utils";

import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";

export default function Login(): ReactNode {
    const turnstileRef = useRef<TurnstileInstance | null>(null);

    const { setLoading, reloadUserData } = useContext(funcContext);

    const [mode, setMode] = useState<"login" | "register">("login");
    const [turnstileToken, setTurnstileToken] = useState<string>("");

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [emailError, setEmailError] = useState<boolean>(false);

    const [error, setError] = useState<string>("");
    const [valid, setValid] = useState<boolean>(false);
    const [canSubmit, setCanSubmit] = useState<boolean>(true);

    const userData = useContext(userDataContext);
    const navigate = useNavigate();

    const submit = async () => {
        if (!valid || !turnstileToken || !canSubmit) return;

        setLoading(true);
        setCanSubmit(false);
        (mode === "login" ? login : register)({
            email: email,
            password: password,
            token: turnstileToken,
        }).then((data) => {
            localStorage.setItem("token_type", data.token_type);
            localStorage.setItem("access_token", data.access_token);
            reloadUserData();
        }).catch((error) => {
            turnstileRef.current?.reset();
            setTurnstileToken("");
            if (error instanceof AxiosError) {
                if (mode === "login" && error.response?.status === 401) {
                    setError("帳號或密碼錯誤");
                }
                else if (mode === "register" && error.response?.status === 400) {
                    setError("帳號已存在");
                }
                else {
                    setError("發生錯誤，請稍後再試");
                }
            } else {
                setError("發生錯誤，請稍後再試");
            }
        }).finally(() => {
            setLoading(false);
            setCanSubmit(true);
        });
    };

    useEffect(() => {
        setEmailError(!!email && !validateEmail(email));
    }, [email]);

    useEffect(() => {
        setError("");
        if (mode === "register" && password !== confirmPassword) {
            setValid(false);
            return;
        }

        if (!email || !password || (mode === "register" && !confirmPassword)) {
            setValid(false);
            return;
        }

        setValid(true);
    }, [email, password, confirmPassword, mode]);

    useEffect(() => {
        if (!!userData)
            navigate("/profile");
    }, [userData]);

    return <div className={styles.loginPage}>
        <div className={styles.box}>
            <div className={`${styles.innerBox} ${styles.login}`} data-show={mode === "login"}>
                <h1>登入</h1>
                <div className={styles.inputBox} data-error={emailError}>
                    <span className="ms">email</span>
                    <input
                        name="account"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter")
                                submit();
                        }}
                    />
                </div>
                <div className={styles.inputBox}>
                    <span className="ms">password</span>
                    <input
                        name="password"
                        type="password"
                        placeholder="密碼"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter")
                                submit();
                        }}
                    />
                </div>
            </div>
            <div className={`${styles.innerBox} ${styles.register}`} data-show={mode === "register"}>
                <h1>註冊</h1>
                <div className={styles.inputBox} data-error={emailError}>
                    <span className="ms">email</span>
                    <input
                        name="account"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter")
                                submit();
                        }}
                    />
                </div>
                <div className={styles.inputBox} data-error={confirmPassword && confirmPassword !== password}>
                    <span className="ms">password</span>
                    <input
                        name="password"
                        type="password"
                        placeholder="密碼"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter")
                                submit();
                        }}
                    />
                </div>
                <div className={styles.inputBox} data-error={confirmPassword && confirmPassword !== password}>
                    <span className="ms">check</span>
                    <input
                        name="confirm_password"
                        type="password"
                        placeholder="確認密碼"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter")
                                submit();
                        }}
                    />
                </div>
            </div>
            <div className={styles.fixedBox}>
                <div className={styles.error} data-show={!!error}>
                    {error}
                </div>
                <Turnstile
                    ref={turnstileRef}
                    className={styles.turnstile}
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                    options={{ theme: "light", size: "flexible" }}
                    onSuccess={(token) => setTurnstileToken(token)}
                    onExpire={() => {
                        turnstileRef.current?.reset();
                        setTurnstileToken("");
                    }}
                />
                <button
                    className={styles.submit}
                    disabled={!turnstileToken || !valid}
                    onClick={submit}
                >{mode === "login" ? "登入" : "註冊"}</button>
                <div className={styles.footer}>
                    <span>{mode === "login" ? "還沒有帳號？" : "已經有帳號了？"}</span>
                    <button onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "註冊" : "登入"}</button>
                </div>
            </div>
        </div>
    </div>
}