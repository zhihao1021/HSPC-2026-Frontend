import type { CityType, LunchType, SIDVerifyState } from "./utils";

export type UserDataRead = Readonly<{
    uid: string;
    email: string;
    city: CityType | null;
    lunch: LunchType | null;
    real_name: string | null;
    school: string | null;
    is_nanbao: boolean;
    is_graduate: boolean;
    team_id: string | null;
    email_verified: boolean;
    student_verified: boolean;
    verify_state: SIDVerifyState;
    is_admin: boolean;
}>;

export const UserDataReadKeys: (keyof UserDataRead)[] = [
    "uid",
    "email",
    "city",
    "lunch",
    "real_name",
    "school",
    "is_nanbao",
    "is_graduate",
    "team_id",
    "email_verified",
    "student_verified",
    "verify_state",
    "is_admin"
];

export type UserDataUpdate = Readonly<{
    origin_password?: string;
    password?: string;
    city?: CityType;
    lunch?: LunchType;
    real_name?: string;
    school?: string;
    is_nanbao?: boolean;
    is_graduate?: boolean;
}>;