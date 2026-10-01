import req from "./base";

export async function verifySidImage(uid: string, result: boolean): Promise<void> {
    await req.put(`/manage/sid-verify/${uid}/${result ? "pass" : "fail"}`);
}
