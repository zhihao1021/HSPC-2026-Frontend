import { type ReactNode } from "react";

import style from "./index.module.scss";

export default function Info(): ReactNode {
    return <div className={style.info}>
        <div className={style.box}>
            <h2>比賽說明</h2>
            <h3 className={style.important}><span>相關資訊請聯絡</span> <a href="mailto:hspc@mail.csie.ncku.edu.tw">hspc@mail.csie.ncku.edu.tw</a></h3>
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
