import { type ReactNode } from "react";

import style from "./index.module.scss";

export default function Info(): ReactNode {
    return <div className={style.info}>
        <div className={style.box}>
            <h2>報名流程</h2>
            <div className={style.flow}>
                <ol>
                    <li>點擊右上角的登入按鈕進行註冊。</li>
                    <li>註冊後前往電子郵件信箱收取驗證信並進行驗證，驗證信發送可能需要幾分鐘的時間，如果 10 分鐘內沒有收到驗證信的話可以於個人資料頁面重新發送。</li>
                    <li>驗證完成後於個人資料頁面填寫各項資料，並上傳學生證，學生證驗證流程可能會需要 1~2 個工作日，驗證後會發送郵件通知並在狀態欄顯示，通過會顯示綠色的「<span data-state="2">已驗證</span>」，未通過則是紅色的「<span data-state="3">驗證失敗</span>」，如果驗證狀態長時間停滯於「<span data-state="1">審核中</span>」的話，請再來信告知。</li>
                    <li>等待驗證期間可以先於下方的隊伍區塊創建或加入隊伍。</li>
                    <li>可透過隊伍狀態旁的詳細資料檢查當前隊伍是否符合參賽資格，當隊伍滿足各項條件後即視為報名完成，並會於隊伍狀態處顯示「<span data-verify="false">已完成報名</span>」。</li>
                </ol>
            </div>
            <h2>比賽規則</h2>
            <h3 className={style.important}><span>相關資訊請聯絡</span> <a href="mailto:hspc@mail.csie.ncku.edu.tw">hspc@mail.csie.ncku.edu.tw</a></h3>
            <div className={style.remain}>信件標題建議加上 <pre>[2026 高中生邀請賽]</pre> 以避免被漏掉</div>
            <a
                href="/2026 第 12 屆國立成功大學暑期高中生程式設計邀請賽.pdf"
                target="_blank"
                referrerPolicy="no-referrer"
                className={style.pdfLink}
            >PDF Link</a>
            <object
                data="/2026 第 12 屆國立成功大學暑期高中生程式設計邀請賽.pdf"
                type="application/pdf"
            />
        </div>
    </div >;
};
