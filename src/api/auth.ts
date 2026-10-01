import req from "./base";

export async function login(data: Readonly<{
    token: string;
    email: string;
    password: string;
}>): Promise<{
    token_type: "Bearer";
    access_token: string;
}> {
    const response = await req.post("/auth/login", {
        token: data.token,
        data: {
            email: data.email,
            password: data.password,
        }
    });

    return response.data;
}

export async function register(data: Readonly<{
    token: string;
    email: string;
    password: string;
}>): Promise<{
    token_type: "Bearer";
    access_token: string;
}> {
    const response = await req.post("/auth/register", {
        token: data.token,
        data: {
            email: data.email,
            password: data.password,
        }
    });

    return response.data;
}

export async function verifyEmail(code: string): Promise<{
    token_type: "Bearer";
    access_token: string;
}> {
    const response = await req.post("/auth/verify-email", { code });

    return response.data;
}

export async function refreshToken(): Promise<{
    token_type: "Bearer";
    access_token: string;
}> {
    const response = await req.post("/auth/refresh");
    return response.data;
}

export async function resendVerificationEmail(): Promise<void> {
    await req.post("/auth/resend-verification-email");
}