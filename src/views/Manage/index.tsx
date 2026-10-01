import { useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { getAllUsers, getSidImageByUid } from "@/api/user";

import funcContext from "@/context/func";
import userDataContext from "@/context/userData";

import type { SidImageRead } from "@/model/sidImage";
import { UserDataReadKeys, type UserDataRead } from "@/model/user";
import { SIDVerifyStateMap, SIDVerifyStateTextMap, type SIDVerifyState, type SIDVerifyStateText } from "@/model/utils";

import styles from "./index.module.scss";
import { verifySidImage } from "@/api/manage";

const pageSize = 10;
type FilterType = Readonly<{
    type: "literal",
    value: string
} | {
    type: "emailVerified",
    value: boolean
} | {
    type: "studentVerified",
    value: SIDVerifyStateText
} | {
    type: "property",
    key: keyof UserDataRead,
    value: string,
    strict: boolean
}>

function filterStringToFilter(filterString: string): FilterType[] {
    const filterProps = filterString.split(",").map(s => s.trim()).filter(s => s);
    const result: FilterType[] = [];

    filterProps.forEach(prop => {
        if (prop === "@email:verified" || prop === "@email:unverified") {
            result.push({ type: "emailVerified", value: prop === "@email:verified" });
            return;
        }

        if (prop === "@sid:unverified" || prop === "@sid:pending" || prop === "@sid:verified" || prop === "@sid:failed") {
            const state = prop.split(":")[1].toUpperCase() as SIDVerifyStateText;
            result.push({ type: "studentVerified", value: state });
            return;
        }

        if ((prop.startsWith("@") || prop.startsWith("$")) && prop.includes(":")) {
            const [_, key, value] = prop.match(/^[@\$]([^:]+):(.+)$/) ?? [];
            if (key && value && UserDataReadKeys.includes(key as keyof UserDataRead)) {
                result.push({
                    type: "property",
                    key: key as keyof UserDataRead,
                    value: value.trim(),
                    strict: prop.startsWith("$")
                });
                return;
            }
        }

        result.push({
            type: "literal",
            value: prop
        });
    });

    return result;
}

function filterMatch(user: UserDataRead, filter: FilterType): boolean {
    if (filter.type === "literal") {
        return user.real_name?.includes(filter.value) ||
            user.school?.includes(filter.value) ||
            user.city?.includes(filter.value) ||
            user.email.includes(filter.value) ||
            user.uid === filter.value;
    } else if (filter.type === "emailVerified") {
        return user.email_verified === filter.value;
    } else if (filter.type === "studentVerified") {
        return SIDVerifyStateMap[user.verify_state] === filter.value;
    } else if (filter.type === "property") {
        const userValue = user[filter.key];
        if (typeof userValue === "boolean") {
            return String(userValue) === filter.value;
        } else if (typeof userValue === "string") {
            return filter.strict ? userValue === filter.value : userValue.includes(filter.value);
        }
    }

    return false;
}

function UserCard(props: Readonly<{
    user: UserDataRead,
    showImg: (src: string) => void
}>): ReactNode {
    const { user, showImg } = props;

    const {
        setLoading
    } = useContext(funcContext);

    const [verifyState, setVerifyState] = useState<SIDVerifyState>(0);
    const [sidImage, setSidImage] = useState<SidImageRead | null | undefined>(undefined);

    const sidStateString = SIDVerifyStateTextMap[SIDVerifyStateMap[verifyState]];

    const verify = (result: boolean) => {
        setLoading(true);
        verifySidImage(user.uid, result).then(() => {
            setVerifyState(result ? 2 : 3);
        }).finally(() => {
            setLoading(false);
        });
    }

    const show = (imageData: string) => {
        showImg(`data:image/jpeg;base64, ${imageData}`);
    }

    useEffect(() => {
        setVerifyState(user.verify_state);
        setSidImage(undefined);
        getSidImageByUid(user.uid).then(data => {
            setSidImage(data);
        });
    }, [user]);

    return <div className={styles.userCard}>
        <div className={styles.uid}>
            <div className={styles.key}>UID</div>
            <div
                className={styles.value}
                title={user.uid}
            >{user.uid}</div>
        </div>
        <div className={styles.email}>
            <div className={styles.key}>Email</div>
            <div
                className={styles.value}
                title={user.email}
            >{user.email}</div>
        </div>
        <div className={styles.field}>
            <div className={styles.key}>姓名</div>
            <div
                className={styles.value}
                data-empty={!user.real_name}
            >{user.real_name ?? "未填寫"}</div>
        </div>
        <div className={styles.field}>
            <div className={styles.key}>學校</div>
            <div
                className={styles.value}
                data-empty={!user.school}
            >{user.school ?? "未填寫"}</div>
        </div>
        <div className={styles.field}>
            <div className={styles.key}>城市</div>
            <div
                className={styles.value}
                data-empty={!user.city}
            >{user.city ?? "未填寫"}</div>
        </div>
        <div className={styles.field}>
            <div className={styles.key}>午餐</div>
            <div
                className={styles.value}
                data-empty={!user.lunch}
            >{user.lunch ?? "未填寫"}</div>
        </div>
        <div className={styles.field}>
            <div className={styles.key}>具南保資格</div>
            <div
                className={styles.value}
            >{user.is_nanbao ? "是" : "否"}</div>
        </div>
        <div className={styles.field}>
            <div className={styles.key}>國中應屆畢業</div>
            <div
                className={styles.value}
            >{user.is_graduate ? "是" : "否"}</div>
        </div>
        <div className={styles.field}>
            <div className={styles.key}>已驗證 Email</div>
            <div
                className={styles.value}
                data-verify={user.email_verified}
            >{user.email_verified ? "是" : "否"}</div>
        </div>
        <div className={styles.field}>
            <div className={styles.key}>學生證驗證狀態</div>
            <div
                className={`${styles.value} ${styles.verifyState}`}
                data-state={verifyState}
            >{sidStateString}</div>
        </div>
        <div className={styles.sidArea}>
            <div className={styles.sidBox}>
                <h3>正面</h3>
                <div className={styles.imageContainer}>
                    <div className={styles.empty}>{sidImage === null ? "尚未上傳照片" : "載入中"}</div>
                    {
                        sidImage?.image_front && <img
                            alt="SID image front"
                            src={`data:image/jpeg;base64, ${sidImage.image_front}`}
                            onClick={() => show(sidImage.image_front)}
                        />
                    }
                </div>
            </div>
            <div className={styles.sidBox}>
                <h3>反面</h3>
                <div className={styles.imageContainer}>
                    <div className={styles.empty}>{sidImage === null ? "尚未上傳照片" : "載入中"}</div>
                    {
                        sidImage?.image_back && <img
                            alt="SID image back"
                            src={`data:image/jpeg;base64, ${sidImage.image_back}`}
                            onClick={() => show(sidImage.image_back)}
                        />
                    }
                </div>
            </div>
        </div>
        {
            user.verify_state !== 0 && <div className={styles.action}>
                <button
                    className={styles.pass}
                    onClick={() => verify(true)}
                >通過</button>
                <button
                    className={styles.fail}
                    onClick={() => verify(false)}
                >不通過</button>
            </div>
        }
    </div>
}

export default function Manage(): ReactNode {
    const userData = useContext(userDataContext);
    const {
        setLoading
    } = useContext(funcContext);

    const [users, setUsers] = useState<UserDataRead[]>([]);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState("");
    const [showImage, setShowImage] = useState<boolean>(false);
    const [showImageSrc, setShowImageSrc] = useState<string>("");

    useEffect(() => {
        if (!userData?.is_admin) return;

        setLoading(true);
        getAllUsers().then(data => {
            setUsers(Array.from(data));
        }).finally(() => {
            setLoading(false);
        });
    }, [userData]);

    const filteredUsers = useMemo(() => {
        const filterList = filterStringToFilter(filter);
        console.log(filterList);

        return users.filter(user => {
            if (filterList.length === 0) return true;

            return filterList.every(filter => filterMatch(user, filter));
        });
    }, [users, filter]);
    const displayUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

    const maxPage = Math.ceil(filteredUsers.length / pageSize);

    useEffect(() => {
        setPage(prev => Math.min(prev, maxPage === 0 ? 1 : maxPage));
    }, [maxPage]);

    if (userData === undefined) return null;
    if (userData === null) return <Navigate to="/" />;
    if (!userData.is_admin) return <Navigate to="/" />;

    return <>
        <div
            className={styles.imageBigview}
            data-show={showImage}
            onClick={() => setShowImage(false)}
        >
            <img src={showImageSrc} />
        </div>
        <div className={styles.manage}>
            <div className={styles.content}>
                <h1>Manage</h1>
                <div className={styles.filter}>
                    <span className="ms">search</span>
                    <input value={filter} onChange={e => setFilter(e.target.value)} />
                </div>
                <div className={styles.pageController}>
                    <button
                        className="ms"
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                    >keyboard_double_arrow_left</button>
                    <button
                        className="ms"
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                    >keyboard_arrow_left</button>
                    <span>第 {page} 頁，共 {maxPage} 頁</span>
                    <button
                        className="ms"
                        onClick={() => setPage(prev => Math.min(prev + 1, maxPage))}
                        disabled={page >= maxPage}
                    >keyboard_arrow_right</button>
                    <button
                        className="ms"
                        onClick={() => setPage(maxPage)}
                        disabled={page >= maxPage}
                    >keyboard_double_arrow_right</button>
                </div>
                <div className={styles.userList}>{
                    displayUsers.map((user) => <UserCard
                        key={user.uid}
                        user={user}
                        showImg={(src) => {
                            setShowImageSrc(src);
                            setShowImage(true);
                        }}
                    />)
                }</div>
                <div className={styles.pageController}>
                    <button
                        className="ms"
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                    >keyboard_double_arrow_left</button>
                    <button
                        className="ms"
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                    >keyboard_arrow_left</button>
                    <span>第 {page} 頁，共 {maxPage} 頁</span>
                    <button
                        className="ms"
                        onClick={() => setPage(prev => Math.min(prev + 1, maxPage))}
                        disabled={page >= maxPage}
                    >keyboard_arrow_right</button>
                    <button
                        className="ms"
                        onClick={() => setPage(maxPage)}
                        disabled={page >= maxPage}
                    >keyboard_double_arrow_right</button>
                </div>
            </div>
        </div>
    </>
}