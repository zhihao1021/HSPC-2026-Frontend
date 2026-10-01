import { useContext, useEffect, useState, type ReactNode } from "react";

import { updateUserData } from "@/api/user";

import funcContext from "@/context/func";
import userDataContext from "@/context/userData";

import { Cities, type CityType, type LunchType } from "@/model/utils";

import styles from "./index.module.scss";
import { resendVerificationEmail } from "@/api/auth";
import { AxiosError } from "axios";

export default function Profile(): ReactNode {
    const userData = useContext(userDataContext);
    const {
        setLoading,
        reloadUserData,
    } = useContext(funcContext);

    const [realName, setRealName] = useState<string | null>(userData?.real_name ?? null);
    const [school, setSchool] = useState<string | null>(userData?.school ?? null);
    const [city, setCity] = useState<CityType | null>(userData?.city ?? null);
    const [lunch, setLunch] = useState<LunchType | null>(userData?.lunch ?? null);
    const [isNanBao, setIsNanBao] = useState<boolean>(userData?.is_nanbao ?? false);
    const [isGraduate, setIsGraduate] = useState<boolean>(userData?.is_graduate ?? false);

    const [message, setMessage] = useState<Readonly<{
        type: "success" | "error",
        content: string,
    }> | null>(null);

    const resendEmail = () => {
        setLoading(true);
        resendVerificationEmail().then(() => setMessage({
            type: "success",
            content: "驗證郵件已重新發送",
        })).catch((error) => {
            if (error instanceof AxiosError) {
                setMessage({
                    type: "error",
                    content: error.status === 429 ? "已發送過郵件，請稍後再試" : "驗證郵件重新發送失敗",
                });
            }
        }).finally(() => setLoading(false));
    }

    const restoreData = () => {
        setRealName(userData?.real_name ?? null);
        setSchool(userData?.school ?? null);
        setCity(userData?.city ?? null);
        setLunch(userData?.lunch ?? null);
        setIsNanBao(userData?.is_nanbao ?? false);
        setIsGraduate(userData?.is_graduate ?? false);
    }

    const saveData = () => {
        if (!userData) return;

        const updateData = {};
        if (realName !== userData.real_name) Object.assign(updateData, { real_name: realName });
        if (school !== userData.school) Object.assign(updateData, { school: school });
        if (city !== userData.city) Object.assign(updateData, { city: city });
        if (lunch !== userData.lunch) Object.assign(updateData, { lunch: lunch });
        if (isNanBao !== userData.is_nanbao) Object.assign(updateData, { is_nanbao: isNanBao });
        if (isGraduate !== userData.is_graduate) Object.assign(updateData, { is_graduate: isGraduate });

        setLoading(true);
        updateUserData(updateData).then(() => {
            return reloadUserData();
        }).then(() => setMessage({
            type: "success",
            content: "更新成功",
        })).catch(() => setMessage({
            type: "error",
            content: "更新失敗",
        })).finally(() => {
            setLoading(false);
        })
    }

    const logout = () => {
        localStorage.removeItem("access_token");
        reloadUserData();
        location.reload();
    }

    useEffect(() => {
        restoreData();
    }, [userData]);

    useEffect(() => {
        setMessage(null);
    }, [realName, school, city, lunch, isNanBao, isGraduate]);

    if (!userData) return;

    return <>
        <h2>個人資料</h2>
        <div className={styles.emailBar}>
            <div className={styles.key}>Email</div>
            <div className={styles.email}>{userData.email}</div>
            <div className={styles.status} data-verified={userData.email_verified}>{userData.email_verified ? "已驗證" : "未驗證"}</div>
            <div className={styles.emailButtons}>
                {!userData.email_verified && <button className={styles.resend} onClick={resendEmail}>
                    <span className="ms">refresh</span>
                    <span>重新發送</span>
                </button>}
                <button className={styles.logout} onClick={logout}>
                    <span className="ms">logout</span>
                    <span>登出</span>
                </button>
            </div>
        </div>
        <div className={styles.form}>
            <div className={styles.field}>
                <div className={styles.key}>姓名</div>
                <input
                    type="text"
                    name="real_name"
                    value={realName ?? ""}
                    onChange={e => setRealName(e.target.value)}
                />
            </div>
            <div className={styles.field}>
                <div className={styles.key}>學校</div>
                <input
                    type="text"
                    name="school"
                    value={school ?? ""}
                    onChange={e => setSchool(e.target.value)}
                />
            </div>
            <div className={styles.field}>
                <div className={styles.key}>城市</div>
                <label className={styles.dropdown}>
                    <input type="checkbox" />
                    <div className={styles.dropdownSelected}>
                        <span>{city ?? "請選擇"}</span>
                        <span className="ms">arrow_drop_down</span>
                    </div>
                    <div className={styles.dropdownOptions}>{
                        Cities.map(v => <div
                            key={v}
                            onClick={() => setCity(v)}
                        >{v}</div>)
                    }</div>
                </label>
            </div>
            <div className={styles.field}>
                <div className={styles.key}>午餐</div>
                <div className={styles.options}>
                    <button
                        data-selected={lunch === "葷"}
                        onClick={() => setLunch("葷")}
                    >葷</button>
                    <button
                        data-selected={lunch === "素"}
                        onClick={() => setLunch("素")}
                    >素</button>
                </div>
            </div>
            <div className={styles.field}>
                <div className={styles.key}>具有南保資格</div>
                <label className={`${styles.checkbox} ms-p`}>
                    <input
                        type="checkbox"
                        checked={isNanBao}
                        onChange={e => setIsNanBao(e.target.checked)}
                    />
                </label>
            </div>
            <div className={styles.field}>
                <div className={styles.key}>國中應屆畢業</div>
                <label className={`${styles.checkbox} ms-p`}>
                    <input
                        type="checkbox"
                        checked={isGraduate}
                        onChange={e => setIsGraduate(e.target.checked)}
                    />
                </label>
            </div>
        </div>
        <div
            className={styles.info}
            data-type={message?.type}
        >{message?.content}</div>
        <div className={styles.buttons}>
            <button className={styles.cancel} onClick={restoreData}>取消</button>
            <button className={styles.save} onClick={saveData}>儲存</button>
        </div>
    </>
}