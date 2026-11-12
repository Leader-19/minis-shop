
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function requireAdmin() {
    const admin = await getSession();

    if (!admin) {
        return {
            admin: null,
            response: NextResponse.json(
                {
                    success: false,
                    message: "Authentication required",
                },
                { status: 401 }
            ),
        };
    }

    return {
        admin,
        response: null,
    };
}
