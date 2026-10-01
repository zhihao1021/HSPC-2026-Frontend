import { createTeam, getTeamData, getTeamMembers, joinTeam, leaveTeam, updateTeamData } from "@/api/team";
import funcContext from "@/context/func";
import type { TeamDataRead } from "@/model/team";
import { useContext, useEffect, useState, type ReactNode } from "react";

import styles from "./index.module.scss";
import { AxiosError } from "axios";
import type { UserDataRead } from "@/model/user";
import userDataContext from "@/context/userData";

export default function Team(): ReactNode {
    const userData = useContext(userDataContext);
    const {
        setLoading
    } = useContext(funcContext);

    const [teamData, setTeamData] = useState<TeamDataRead | null>(null);
    const [teamMembers, setTeamMembers] = useState<readonly UserDataRead[]>([]);

    const [showBox, setShowBox] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<"create" | "join" | "edit" | null>(null);
    const [boxMessage, setBoxMessage] = useState<string>("");
    const [boxValue, setBoxValue] = useState<string>("");

    const [copySuccess, setCopySuccess] = useState<boolean>(false);

    const fetchTeamData = () => {
        setLoading(true);
        getTeamData().then(data => {
            setTeamData(data);

            return getTeamMembers();
        }).then(members => {
            setTeamMembers(members);
        }).catch(() => {
            setTeamData(null);
            setTeamMembers([]);
        }).finally(() => setLoading(false));
    }

    const openBox = (mode: "create" | "join" | "edit") => {
        setBoxMessage("");
        setBoxValue(mode === "edit" && teamData ? teamData.name : "");
        setEditMode(mode);
        setShowBox(true);
    }

    const boxSubmit = () => {
        setLoading(true);
        if (editMode === "join") {
            joinTeam(boxValue).then(() => {
                setShowBox(false);
                fetchTeamData();
            }).catch(err => {
                if (err instanceof AxiosError) {
                    if (err.response?.status === 404) {
                        setBoxMessage("隊伍不存在");
                        return;
                    }
                    else if (err.response?.status === 400) {
                        setBoxMessage("隊伍已滿");
                        return;
                    }
                }
                setBoxMessage("發生錯誤，請稍後再試");
            }).finally(() => setLoading(false));
        } else {
            (editMode === "create" ? createTeam : updateTeamData)({
                name: boxValue
            }).then(() => {
                setShowBox(false);
                fetchTeamData();
            }).catch(err => {
                if (err instanceof AxiosError) {
                    if (err.response?.status === 400) {
                        setBoxMessage("隊伍名稱已存在");
                        return;
                    }
                }
                setBoxMessage("發生錯誤，請稍後再試");
            }).finally(() => setLoading(false));
        }
    }

    useEffect(() => {
        fetchTeamData();
    }, [userData]);

    const ruleChecker: Readonly<{
        allEmailVerified: boolean;
        allStudentVerified: "verified" | "unverified" | "pending";
        allInfoFilled: boolean;
        memberCount: number;
    }> = {
        allEmailVerified: teamMembers.every(member => member.email_verified),
        allStudentVerified: teamMembers.every(member => member.student_verified) ? "verified"
            : teamMembers.every(member => member.student_verified || member.verify_state === 1) ? "pending"
                : "unverified",
        allInfoFilled: teamMembers.every(member => member.real_name && member.school && member.city && member.lunch),
        memberCount: teamMembers.length,
    }

    return <>
        <div
            className={styles.editTeam}
            data-show={showBox}
            onClick={e => {
                const target = e.target as HTMLElement;
                if (target?.classList.contains(styles.editTeam)) {
                    setShowBox(false);
                }
            }}
        >
            <div className={styles.box}>
                <h3>{editMode === "create" ? "創建隊伍" : editMode === "join" ? "加入隊伍" : "編輯隊伍"}</h3>
                <div className={styles.field}>
                    <div className={styles.key}>{editMode === "join" ? "隊伍 ID" : "隊伍名稱"}</div>
                    <input
                        name={editMode === "join" ? "teamUid" : "teamName"}
                        type="text"
                        value={boxValue}
                        onChange={e => setBoxValue(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter")
                                boxSubmit();
                        }}
                    />
                </div>
                {boxMessage && <div className={styles.info}>{boxMessage}</div>}
                <div className={styles.buttons}>
                    <button
                        className={styles.cancel}
                        onClick={() => setShowBox(false)}
                    >取消</button>
                    <button
                        className={styles.confirm}
                        onClick={boxSubmit}
                    >{editMode === "create" ? "創建" : editMode === "join" ? "加入" : "保存"}</button>
                </div>
            </div>
        </div>
        <h2>隊伍資料</h2>
        {
            teamData === null ? <div className={styles.emptyTeam}>
                <button onClick={() => alert("報名期限已過，無法創建隊伍")}>
                    <span className="ms">add</span>
                    <span className={styles.createTeam}>創建隊伍</span>
                    <span>報名已截止</span>
                </button>
                <span className={styles.or}>or</span>
                <button onClick={() => openBox("join")}>
                    <span className="ms">group_add</span>
                    <span>加入隊伍</span>
                </button>
            </div> : <>
                <div className={styles.ruleChecker}>
                    <div className={styles.result}>
                        <div className={styles.key}>隊伍狀態：</div>
                        <div className={styles.value}>{
                            ruleChecker.allEmailVerified && ruleChecker.allInfoFilled && ruleChecker.memberCount === 3 ? (
                                ruleChecker.allStudentVerified === "verified" ? <span className={styles.qualified}>已完成報名</span>
                                    : <span className={styles.pending}>審核中</span>
                            ) : <span className={styles.unqualified}>未完成報名</span>
                        }</div>
                        <label className={styles.hint}>
                            <span className="ms">arrow_right</span>
                            <span>詳細資料</span>
                            <input type="checkbox" />
                        </label>
                    </div>
                    <div className={styles.detail}>
                        <div className={styles.field}>
                            <div className={styles.key}>隊伍人數</div>
                            <div
                                className={styles.value}
                                data-verify={ruleChecker.memberCount === 3}
                            >{ruleChecker.memberCount} / 3</div>
                        </div>
                        <div className={styles.field}>
                            <div className={styles.key}>Email 驗證</div>
                            <div
                                className={styles.value}
                                data-verify={ruleChecker.allEmailVerified}
                            >{ruleChecker.allEmailVerified ? "完成" : "未完成"}</div>
                        </div>
                        <div className={styles.field}>
                            <div className={styles.key}>學生證驗證</div>
                            <div
                                className={styles.value}
                                data-verify={ruleChecker.allStudentVerified}
                            >{
                                    ruleChecker.allStudentVerified === "verified" ? "完成"
                                        : ruleChecker.allStudentVerified === "pending" ? "驗證中"
                                            : "未完成"
                                }</div>
                        </div>
                        <div className={styles.field}>
                            <div className={styles.key}>個人資料</div>
                            <div
                                className={styles.value}
                                data-verify={ruleChecker.allInfoFilled}
                            >{ruleChecker.allInfoFilled ? "完成" : "未完成"}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.teamInfo}>
                    <div className={styles.field}>
                        <div className={styles.key}>隊伍 ID</div>
                        <div className={styles.value}>{teamData.uid}</div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(teamData.uid).then(() => {
                                    setCopySuccess(true);
                                    setTimeout(() => setCopySuccess(false), 1500);
                                })
                            }}
                            data-success={copySuccess}
                        >
                            <span className="ms">content_copy</span>
                            <span>複製</span>
                        </button>
                    </div>
                    <div className={styles.field}>
                        <div className={styles.key}>隊伍名稱</div>
                        <div className={styles.value}>{teamData.name}</div>
                        <button
                            onClick={() => openBox("edit")}
                        >
                            <span className="ms">edit</span>
                            <span>編輯</span>
                        </button>
                    </div>
                </div>
                <h3 className={styles.memberTitle}>隊伍成員</h3>
                <div className={styles.members}>{teamMembers.map(member => <div
                    key={member.uid}
                    className={styles.memberCard}
                >
                    <div className={styles.field}>
                        <div className={styles.key}>姓名</div>
                        <div
                            className={styles.value}
                            data-empty={!member.real_name}
                        >{member.real_name ?? "未填寫"}</div>
                    </div>
                    <div className={styles.field}>
                        <div className={styles.key}>學校</div>
                        <div
                            className={styles.value}
                            data-empty={!member.school}
                        >{member.school ?? "未填寫"}</div>
                    </div>
                    <div className={styles.field}>
                        <div className={styles.key}>城市</div>
                        <div
                            className={styles.value}
                            data-empty={!member.city}
                        >{member.city ?? "未填寫"}</div>
                    </div>
                    <div className={styles.field}>
                        <div className={styles.key}>午餐</div>
                        <div
                            className={styles.value}
                            data-empty={!member.lunch}
                        >{member.lunch ?? "未填寫"}</div>
                    </div>
                    <div className={styles.field}>
                        <div className={styles.key}>具南保資格</div>
                        <div
                            className={styles.value}
                        >{member.is_nanbao ? "是" : "否"}</div>
                    </div>
                    <div className={styles.field}>
                        <div className={styles.key}>國中應屆畢業</div>
                        <div
                            className={styles.value}
                        >{member.is_graduate ? "是" : "否"}</div>
                    </div>
                    <div className={styles.field}>
                        <div className={styles.key}>已驗證 Email</div>
                        <div
                            className={styles.value}
                            data-verify={member.email_verified}
                        >{member.email_verified ? "是" : "否"}</div>
                    </div>
                    <div className={styles.field}>
                        <div className={styles.key}>已驗證學生證</div>
                        <div
                            className={styles.value}
                            data-verify={member.student_verified}
                        >{member.student_verified ? "是" : "否"}</div>
                    </div>
                </div>)
                }</div>
                <div className={styles.leaveButton}>
                    <button>
                        <span className="ms">logout</span>
                        <span onClick={() => {
                            setLoading(true);
                            leaveTeam().then(() => {
                                fetchTeamData();
                            }).finally(() => setLoading(false));
                        }}>離開隊伍</span>
                    </button>
                </div>
            </>
        }
    </>
}