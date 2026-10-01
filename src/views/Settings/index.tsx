import { useContext, type ReactNode } from "react";
import { Navigate } from "react-router-dom";

import userDataContext from "@/context/userData";

import Profile from "./Profile";
import SidImage from "./SidImage";
import Team from "./Team";

import styles from "./index.module.scss";

export default function Settings(): ReactNode {
    const userData = useContext(userDataContext);

    if (userData === null) return <Navigate to="" />;

    return <div className={styles.profile}>
        <div className={styles.content}>
            <div className={styles.ruleInfo}>
                <h2>注意事項</h2>
                <div>
                    創建或加入隊伍後，只要隊伍符合下列事項即為報名完成：
                    <ul>
                        <li>隊伍成員皆完成 email 驗證</li>
                        <li>隊伍成員皆完成學生證驗證</li>
                        <li>隊伍成員皆填寫完個人資料</li>
                        <li>每隊成員<strong>必須為三人</strong></li>
                    </ul>
                    比賽規則相比各校所收到的公文有所更動，請以網站上的規則為準，務必於賽前詳閱規則，如果有任何問題請聯絡我們。
                </div>
            </div>
            <Profile />
            <SidImage />
            <Team />
        </div>
    </div>
}