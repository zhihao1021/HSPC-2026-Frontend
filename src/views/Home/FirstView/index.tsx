import { type ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import style from "./index.module.scss";

export default function FirstView(): ReactNode {
    const [open, setOpen] = useState<boolean>(false);

    useEffect(() => {
        setOpen(true);
    }, []);

    return <div className={style.firstView}>
        <img src="/landing.webp" alt="Landing" />
        <div className={style.title} data-open={open}>
            <div className={style.border} />
            <div className={style.titleBox}>
                <h1>HSPC 2026</h1>
                <h2>國立成功大學暑期高中生程式設計邀請賽</h2>
                <div className={style.info}>
                    <div>初賽：2026-05-31</div>
                    <div>決賽：2026-08-14</div>
                    <div>地點：國立成功大學 資訊工程學系</div>
                </div>
            </div>
        </div>
        <Link
            to="/about"
            className={`ms ${style.scrollDown}`}
            onClick={() => window.scrollTo({
                top: window.innerHeight,
                behavior: "smooth"
            })}
            replace
        >stat_minus_2</Link>
    </div>
}