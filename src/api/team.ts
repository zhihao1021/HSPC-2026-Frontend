import type { TeamDataCreate, TeamDataRead, TeamDataUpdate } from "@/model/team";
import type { UserDataRead } from "@/model/user";

import req from "./base";

export async function getTeamData(): Promise<TeamDataRead> {
    const response = await req.get("/team");

    return response.data;
}

export async function createTeam(data: TeamDataCreate): Promise<TeamDataRead> {
    const response = await req.post("/team", data);

    return response.data;
}

export async function updateTeamData(data: TeamDataUpdate): Promise<TeamDataRead> {
    const response = await req.put("/team", data);

    return response.data;
}

export async function leaveTeam(): Promise<void> {
    await req.delete("/team");
}

export async function joinTeam(teamUid: string): Promise<TeamDataRead> {
    const response = await req.put(`/team/${teamUid}`);

    return response.data;
}

export async function getTeamMembers(): Promise<readonly UserDataRead[]> {
    const response = await req.get("/team/members");

    return response.data;
}
