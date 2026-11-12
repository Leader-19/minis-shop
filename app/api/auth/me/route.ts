
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
    const admin = await getSession();

    if (!admin) {
        return NextResponse.json(
            { success: false, message: "Unauthenticated" },
            { status: 401 }
        );
    }

    return NextResponse.json({
        success: true,
        data: admin,
    });
}
