import { AxiosError } from "axios";

import type { UserDataRead, UserDataUpdate } from "@/model/user";

import req from "./base";
import type { SidImageRead } from "@/model/sidImage";

export async function getUserData(): Promise<UserDataRead | null> {
    try {
        const response = await req.get("/user");
        return response.data;
    }
    catch (error) {
        if (!(error instanceof AxiosError))
            throw error;

        return null;
    }
}

export async function updateUserData(data: UserDataUpdate): Promise<UserDataRead> {
    const response = await req.put("/user", data);

    return response.data;
}

export async function getSidImage(): Promise<SidImageRead | null> {
    const response = await req.get("/user/sid");

    return response.data;
}

export async function uploadSidImage(file: File, type: "back" | "front"): Promise<void> {
    const formData = new FormData();
    formData.append("image", file);

    await req.put(`/user/sid/${type}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}
