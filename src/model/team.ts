export type TeamDataRead = Readonly<{
    uid: string;
    name: string;
}>;

export type TeamDataCreate = Readonly<{
    name: string;
}>;

export type TeamDataUpdate = Readonly<{
    name?: string;
}>;
