import type { ReactNode } from "react";

import styles from "./index.module.scss";

export default function Loading(props: Readonly<{
    show: boolean;
}>): ReactNode {
    const { show } = props;

    return <div className={styles.loading} data-show={show}>
        <div className={styles.box}>{
            Array.from({ length: 5 }).map((_, i) => <div
                key={i}
                className={styles.strip}
                style={{ animationDelay: `${i / 8}s` }}
            />)
        }</div>
    </div>;
}