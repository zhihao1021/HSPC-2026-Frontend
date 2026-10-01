import { type ReactNode, useRef } from "react";

import aboutData from "@/data/about.json";

import style from "./index.module.scss";

export default function About(): ReactNode {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        const element = scrollRef.current;
        if (!element) return;

        const scrollUnit = (element.clientWidth - element.scrollWidth) / (aboutData.length - 1);
        const rawTarget = element.scrollLeft + (direction === "left" ? scrollUnit : -scrollUnit);
        const target = Math.round(rawTarget / scrollUnit) * scrollUnit;

        element.scrollTo({
            left: target,
            behavior: "smooth"
        });
    };

    return <div className={style.about}>
        <h2>關於競賽</h2>
        <div className={style.container}>
            <button
                className={`ms ${style.scrollBtn} ${style.prevBtn}`}
                onClick={() => scroll("left")}
            >chevron_left</button>
            <div className={style.gallery} ref={scrollRef}>
                {aboutData.map((data) => (
                    <div key={data.name} className={style.card}>
                        <div className={style.imageWrapper}>
                            <img src={data.imageUrl} alt={data.name} />
                        </div>
                        <h3>{data.name}</h3>
                        <p>{data.description}</p>
                    </div>
                ))}
            </div>
            <button
                className={`ms ${style.scrollBtn} ${style.nextBtn}`}
                onClick={() => scroll("right")}
            >chevron_right</button>
        </div>
        <h2>加入 Discord</h2>
        <a className={style.discordLink} href={import.meta.env.VITE_DISCORD_LINK} target="_blank" rel="noopener noreferrer">
            <img alt="Discord icon" src="/Discord-Logo-White.svg" />
        </a>
    </div>;
};
