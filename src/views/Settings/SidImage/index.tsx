import { useContext, useEffect, useState, type ReactNode } from "react";

import { getSidImage, uploadSidImage } from "@/api/user";
import funcContext from "@/context/func";
import userDataContext from "@/context/userData";
import type { SidImageRead } from "@/model/sidImage";
import { SIDVerifyStateMap, SIDVerifyStateTextMap } from "@/model/utils";

import styles from "./index.module.scss";

export default function SidImage(): ReactNode {
    const userData = useContext(userDataContext);
    const {
        setLoading,
        reloadUserData
    } = useContext(funcContext);

    const [sidImage, setSidImage] = useState<SidImageRead | null>(null);
    const [sidFile, setSidFile] = useState<File | null>(null);
    const [sidFileType, setSidFileType] = useState<"front" | "back" | null>(null);
    const [sidFileUrl, setSidFileUrl] = useState<string>("");

    const [boxMessage, setBoxMessage] = useState<string>("");

    const fetchImage = () => {
        setLoading(true);
        getSidImage().then(
            data => setSidImage(data)
        ).catch(() => {
            setSidImage(null);
        }).finally(() => {
            setLoading(false);
        })
    }

    const resetImage = () => {
        setSidFile(null);
        setSidFileType(null);
        setSidFileUrl(url => {
            URL.revokeObjectURL(url);
            return "";
        });
    }

    const updateImage = (image_type: "front" | "back", data?: File | null) => {
        if (!data) return;

        setBoxMessage("");
        setSidFile(data);
        setSidFileType(image_type);
        setSidFileUrl(url => {
            if (url) URL.revokeObjectURL(url);
            return URL.createObjectURL(data);
        });
    }

    const uploadImage = () => {
        if (!sidFile || !sidFileType) return;

        setLoading(true);
        uploadSidImage(sidFileType, sidFile).then(() => {
            resetImage();
            fetchImage();
            reloadUserData();
        }).catch(() => {
            setBoxMessage("上傳學生證照片失敗");
        }).finally(() => {
            setLoading(false);
        })
    }

    useEffect(() => {
        fetchImage();
    }, []);

    if (!userData) return;

    return <>
        <div className={styles.uploadPreview} onClick={e => {
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
                    <div className={styles.empty}>照片無法顯示</div>
                    {
                        sidFileUrl && <img
                            alt="SID image preview"
                            src={sidFileUrl}
                        />
                    }
                </div>
                <div
                    className={styles.info}
                    data-show={!!boxMessage}
                >{boxMessage}</div>
                <div className={styles.buttons}>
                    <button className={styles.cancel} onClick={() => {
                        setSidFile(null);
                        setSidFileType(null);
                    }}>取消</button>
                    <button
                        className={styles.confirm}
                        onClick={uploadImage}
                    >確定</button>
                </div>
            </div>
        </div >

        <h2>上傳學生證</h2>
        <div className={styles.sidStatus}>
            <span>當前狀態：</span>
            <span
                className={styles.verifyState}
                data-state={userData.verify_state}
            >{SIDVerifyStateTextMap[SIDVerifyStateMap[userData.verify_state]]}</span>
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
                        sidImage?.image_front && <img
                            alt="SID image front"
                            src={`data:image/jpeg;base64, ${sidImage.image_front}`}
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
                        sidImage?.image_back && <img
                            alt="SID image back"
                            src={`data:image/jpeg;base64, ${sidImage.image_back}`}
                        />
                    }
                </div>
            </div>
        </div>
    </>
}