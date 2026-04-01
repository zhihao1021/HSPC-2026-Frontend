import { useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { getSidImage, updateUserData, uploadSidImage } from "@/api/user";

import funcContext from "@/context/func";
import userDataContext from "@/context/userData";

import { SIDVerifyStateMap, SIDVerifyStateTextMap, type CityType } from "@/model/utils";
import type { SidImageRead } from "@/model/sidImage";

import styles from "./index.module.scss";

const citys: CityType[] = [
    "臺北市",
    "新北市",
    "桃園市",
    "臺中市",
    "臺南市",
    "高雄市",
    "新竹縣",
    "苗栗縣",
    "彰化縣",
    "南投縣",
    "雲林縣",
    "嘉義縣",
    "屏東縣",
    "宜蘭縣",
    "花蓮縣",
    "臺東縣",
    "澎湖縣",
    "金門縣",
    "連江縣",
    "基隆市",
    "新竹市",
    "嘉義市",
    "大石頭"
]

export default function Profile(): ReactNode {
    const userData = useContext(userDataContext);
    const {
        setLoading,
        reloadUserData,
    } = useContext(funcContext);

    const [realName, setRealName] = useState(userData?.real_name || "");
    const [school, setSchool] = useState(userData?.school || "");
    const [city, setCity] = useState<CityType | null>(userData?.city || null);
    const [lunch, setLunch] = useState<"葷" | "素" | null>(null);
    const [isNanbao, setIsNanbao] = useState<boolean>(false);
    const [isGraduate, setIsGraduate] = useState<boolean>(false);

    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");

    const [sidImageData, setSidImageData] = useState<SidImageRead | null>(null);
    const [sidFile, setSidFile] = useState<File | null>(null);
    const [sidFileUrl, setSidFileUrl] = useState<string>("");
    const [sidFileType, setSidFileType] = useState<"front" | "back" | null>(null);

    const [info, setInfo] = useState<{ type: "error" | "success", message: string } | null>(null);

    const verifyState = userData ? SIDVerifyStateMap[userData.verify_state] : null;
    const verifyStateText = verifyState ? SIDVerifyStateTextMap[verifyState] : "未知";

    const navigate = useNavigate();

    const restoreData = () => {
        setRealName(userData?.real_name || "");
        setSchool(userData?.school || "");
        setCity(userData?.city || null);
        setLunch(userData?.lunch || null);
        setIsNanbao(userData?.is_nanbao || false);
        setIsGraduate(userData?.is_graduate || false);
        setOldPassword("");
        setNewPassword("");
    }

    const fetchSidImageData = () => {
        setLoading(true);
        getSidImage().then(
            d => setSidImageData(d)
        ).catch(
            () => setSidImageData(null)
        ).finally(() => setLoading(false));
    }

    const updateData = () => {
        const data = {};
        if (realName !== userData?.real_name) Object.assign(data, { real_name: realName });
        if (school !== userData?.school) Object.assign(data, { school: school });
        if (city !== userData?.city) Object.assign(data, { city: city });
        if (lunch !== userData?.lunch) Object.assign(data, { lunch: lunch });
        if (isNanbao !== userData?.is_nanbao) Object.assign(data, { is_nanbao: isNanbao });
        if (isGraduate !== userData?.is_graduate) Object.assign(data, { is_graduate: isGraduate });

        if (oldPassword && newPassword) Object.assign(data, {
            origin_password: oldPassword,
            password: newPassword
        });

        setLoading(true);
        updateUserData(data).then(
            () => reloadUserData()
        ).then(
            () => setInfo({ type: "success", message: "更新成功" })
        ).catch(
            () => setInfo({ type: "error", message: "更新失敗" })
        ).finally(() => setLoading(false));
    }

    const updateImage = (type: "front" | "back", file?: File | null) => {
        if (!file) return;
        setSidFile(file);
        setSidFileType(type);
    }

    const confirmUpdateImage = () => {
        if (!sidFile || !sidFileType) return;

        setLoading(true);
        uploadSidImage(sidFile, sidFileType).then(() => {
            setSidFile(null);
            setSidFileType(null);
            fetchSidImageData();
        }).catch(() => {
            setInfo({ type: "error", message: "上傳失敗" });
        }).finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchSidImageData();
    }, []);

    useEffect(() => {
        if (userData === null) navigate("/login");

        restoreData();
    }, [userData]);

    useEffect(() => {
        setInfo(null);
    }, [realName, school, city, lunch, isNanbao, isGraduate, oldPassword, newPassword]);

    useEffect(() => {
        if (!sidFile || !sidFileType) return;

        const url = URL.createObjectURL(sidFile);
        setSidFileUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [sidFile, sidFileType]);

    return <>
        <div className={styles.sidPreview} onClick={e => {
            const target = e.target as HTMLElement;
            if (!target) return;
            if (target.classList.contains(styles.sidPreview)) {
                setSidFile(null);
                setSidFileType(null);
            }
        }} data-show={!!sidFile}>
            <div className={styles.box}>
                <div className={styles.header}>
                    <h2>上傳預覽</h2>
                </div>
                <div className={styles.imageContainer}>
                    <div className={styles.empty}>尚未選擇照片</div>
                    {
                        sidFileUrl && <img
                            alt="SID image preview"
                            src={sidFileUrl}
                        />
                    }
                </div>
                <div className={styles.buttons}>
                    <button className={styles.cancel} onClick={() => {
                        setSidFile(null);
                        setSidFileType(null);
                    }}>取消</button>
                    <button
                        className={styles.confirm}
                        onClick={() => confirmUpdateImage()}
                    >確定</button>
                </div>
            </div>
        </div >
        <div className={styles.profile}>
            <div className={styles.content}>
                <h2>個人資料</h2>
                <div className={styles.functions}>
                    <div className={styles.key}>Email</div>
                    <div className={styles.email}>{userData?.email}</div>
                    <div className={styles.status} data-verified={userData?.email_verified}>{userData?.email_verified ? "已驗證" : "未驗證"}</div>
                    <button className={styles.logout}>
                        <span className="ms">logout</span>
                        <span onClick={() => {
                            localStorage.removeItem("access_token");
                            reloadUserData();
                            location.reload();
                        }}>登出</span>
                    </button>
                </div>
                <div className={styles.form}>
                    <div className={styles.field}>
                        <div className={styles.key}>姓名</div>
                        <input
                            type="text"
                            name="real_name"
                            value={realName}
                            onChange={e => setRealName(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <div className={styles.key}>學校</div>
                        <input
                            type="text"
                            name="school"
                            value={school}
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
                                citys.map(v => <div
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
                                checked={isNanbao}
                                onChange={e => setIsNanbao(e.target.checked)}
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
                    data-type={info?.type}
                >{info?.message}</div>
                <div className={styles.buttons}>
                    <button className={styles.restore} onClick={restoreData}>還原</button>
                    <button className={styles.save} onClick={updateData}>儲存</button>
                </div>
                <h2>上傳學生證</h2>
                <div className={styles.sidStatus}>
                    <span>當前狀態：</span>
                    <span
                        className={styles.verifyState}
                        data-state={userData?.verify_state}
                    >{verifyStateText}</span>
                </div>
                <div className={styles.sidArea}>
                    <div className={styles.sidBox}>
                        <div className={styles.header}>
                            <h3>正面</h3>
                            <label>
                                <span className="ms">upload</span>
                                <span>變更</span>
                                <input
                                    type="file"
                                    name="sid_image_front"
                                    accept="image/*"
                                    onChange={e => updateImage(
                                        "front",
                                        e.target.files?.item(0)
                                    )}
                                    value=""
                                />
                            </label>
                        </div>
                        <div className={styles.imageContainer}>
                            <div className={styles.empty}>尚未上傳照片</div>
                            {
                                sidImageData?.image_front && <img
                                    alt="SID image front"
                                    src={`data:image/jpeg;base64, ${sidImageData.image_front}`}
                                />
                            }
                        </div>
                    </div>
                    <div className={styles.sidBox}>
                        <div className={styles.header}>
                            <h3>反面</h3>
                            <label>
                                <span className="ms">upload</span>
                                <span>變更</span>
                                <input
                                    type="file"
                                    name="sid_image_back"
                                    accept="image/*"
                                    onChange={e => updateImage(
                                        "back",
                                        e.target.files?.item(0)
                                    )}
                                    value=""
                                />
                            </label>
                        </div>
                        <div className={styles.imageContainer}>
                            <div className={styles.empty}>尚未上傳照片</div>
                            {
                                sidImageData?.image_back && <img
                                    alt="SID image back"
                                    src={`data:image/jpeg;base64, ${sidImageData.image_back}`}
                                />
                            }
                        </div>
                    </div>
                </div>
                <h2>隊伍資料</h2>
                <div className={styles.wait}>施工中，請稍後...</div>
            </div>
        </div>
    </>
}