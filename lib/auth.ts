
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { AdminSession } from "@/types/admin";

const COOKIE_NAME = "admin_session";
const SESSION_DURATION = 60 * 60 * 8;

function getSecret() {
    const secret = process.env.AUTH_SECRET;

    if (!secret) {
        throw new Error("AUTH_SECRET is missing");
    }

    return new TextEncoder().encode(secret);
}

export async function createSession(admin: AdminSession) {
    const token = await new SignJWT({
        name: admin.name,
        email: admin.email,
        role: admin.role,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(admin.id)
        .setIssuedAt()
        .setExpirationTime(`${SESSION_DURATION}s`)
        .sign(getSecret());

    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DURATION,
    });
}

export async function getSession(): Promise<AdminSession | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    try {
        const { payload } = await jwtVerify(token, getSecret());

        if (
            typeof payload.sub !== "string" ||
            typeof payload.name !== "string" ||
            typeof payload.email !== "string" ||
            !["super_admin", "admin", "manager"].includes(
                String(payload.role)
            )
        ) {
            return null;
        }

        return {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            role: payload.role as AdminSession["role"],
        };
    } catch {
        return null;
    }
}

export async function destroySession() {
    const cookieStore = await cookies();

    cookieStore.delete(COOKIE_NAME);
}
